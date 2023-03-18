import math
import numpy as np
from scipy.signal import savgol_filter
import matplotlib.pyplot as plt
from matplotlib.widgets import Slider, Button
import json

# Constants: ############################################################################################################################################
G_TO_MS2 = 9.80665
TRAIN_ACC_G = 0.1
TRAIN_ACC_MS2 = TRAIN_ACC_G * G_TO_MS2
TRAIN_DEC_G = 0.12
TRAIN_DEC_MS2 = TRAIN_DEC_G * G_TO_MS2
#########################################################################################################################################################

# Helper functions: #####################################################################################################################################
# Source: https://www.movable-type.co.uk/scripts/latlong.html
def calc_distance_two_points(point_a, point_b):
    R = 6371e3 # meters
    φ1 = point_a[1] * math.pi/180 # φ, λ in radians
    φ2 = point_b[1] * math.pi/180
    Δφ = (point_b[1]-point_a[1]) * math.pi/180
    Δλ = (point_b[0]-point_a[0]) * math.pi/180
    
    a = math.sin(Δφ/2) * math.sin(Δφ/2) + math.cos(φ1) * math.cos(φ2) * math.sin(Δλ/2) * math.sin(Δλ/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c # meters

def calc_radius_curve(point_a, point_b, point_c):
    x1 = float(point_a[0])
    y1 = float(point_a[1])
    x2 = float(point_b[0])
    y2 = float(point_b[1])
    x3 = float(point_c[0])
    y3 = float(point_c[1])

    xCoefficientArray = [x2 - x1, y2 - y1]
    yCoefficientArray = [x3 - x1, y3 - y1]

    coefficientArray = np.array([xCoefficientArray,yCoefficientArray])
    constantArray = np.array([(pow(x2,2) + pow(y2,2) - pow(x1,2) - pow(y1,2))/2, (pow(x3,2) + pow(y3,2) - pow(x1,2) - pow(y1,2))/2])

    try:
        center = np.linalg.solve(coefficientArray, constantArray)
        return calc_distance_two_points(point_a, center)
    except:
        # print("It's a straight line")
        return None
    
def calc_curve_resistance(radius, numerator=650, denominator=55):
    return numerator/(radius-denominator) # [N/kN]

def calc_curve_resistance_force(point_a, point_b, point_c, mass, numerator=650, denominator=55):
    radius = calc_radius_curve(point_a, point_b, point_c)
    if radius is None:
        return 0
    resistance = calc_curve_resistance(radius, numerator, denominator)
    mass_in_tons = mass/1000
    return resistance * mass_in_tons * G_TO_MS2

def get_elevation_slope_cos(point_a, point_b, dist):
    elevation_delta = point_b[2] - point_a[2]
    slope_distance = math.sqrt(elevation_delta**2 + dist**2)
    return dist/slope_distance, slope_distance

def get_elevation_slope_sin(point_a, point_b, dist):
    elevation_delta = abs(point_b[2] - point_a[2])
    slope_distance = math.sqrt(elevation_delta**2 + dist**2)
    return elevation_delta/slope_distance, slope_distance

def calc_normal_force(mass, angle_cos):
    return mass*G_TO_MS2*angle_cos

def calc_adhesion_ck(velocity):
    return 7500/(velocity+44)+161 #μ_max

def calc_tangential_force(mass, angle_cos, velocity):
    velocity_in_kph = velocity*3.6
    normal_force_in_kn = calc_normal_force(mass, angle_cos)/1000
    return normal_force_in_kn*calc_adhesion_ck(velocity_in_kph)

def calc_parallel_g_force(mass, angle_sin):
    return mass*G_TO_MS2*angle_sin

def calc_running_resistance(velocity, a=1.35, b=0.0008, c=0.00033):
    if velocity == 0:
        a = 0
    velocity_in_kph = velocity*3.6
    return a+b*velocity_in_kph+c*velocity_in_kph**2

def calc_running_resistance_force(velocity, mass, a=1.35, b=0.0008, c=0.00033):
    # print(velocity, mass)
    resistance = calc_running_resistance(velocity, a, b, c)
    mass_in_tons = mass/1000
    return resistance * mass_in_tons * G_TO_MS2

def calc_acceleration(force, mass):
    return force/mass

def calc_velocity(acceleration, distance, init_velocity=0):
    return math.sqrt(init_velocity**2 + 2*acceleration*distance)

def calc_reverse_acceleration(velocity, distance, init_velocity):
    return (velocity**2-init_velocity**2)/(2*distance)

def calc_force(mass, acceleration):
    return mass*acceleration

def draw_plot(dist_values, highlight_zero, args):
    fig=plt.figure(figsize=(20,4), dpi= 100)
    plt.xlabel("Vzdálenost (m)")
    if highlight_zero:
        plt.axhline(y=0, color="grey", linestyle="dotted")
    if "stations" in args:
        plt.plot(dist_values, args["values"], "-D", label=args["name"], markevery=args["stations"])
    elif "scatter" in args and args["scatter"]:
        plt.scatter(dist_values, args["values"], label=args["name"], marker="o")
    else:
        plt.plot(dist_values, args["values"], label=args["name"])
    if "limit_values" in args:
        plt.plot(dist_values, args["limit_values"], linestyle="dotted", label=args["limit_name"])
    plt.legend()
    plt.show()

def parse_points_from_geojson(geojson_raw):
    geojson = json.loads(geojson_raw)
    return geojson["coordinates"]

def parse_stations_from_geojson(geojson_raw):
    geojson = json.loads(geojson_raw)
    return geojson["station_orders"]

def parse_max_velocity_from_geojson(geojson_raw):
    geojson = json.loads(geojson_raw)
    velocity_ways_raw = geojson["velocity_ways"]
    max_velocities = []
    for v in velocity_ways_raw:
        max_velocities += [v["velocity"]]*(v["end"]-v["start"]+1)
    return max_velocities

def get_power_raw(force_values, velocity_values):
    return [force_values[i]*velocity_values[i] for i in range(len(force_values))]

def get_energy_from_force(force_values, dist_values):
    to_return = []
    running_sum = 0
    for i in range(len(force_values)):
        if i > 0:
            cur_dist = dist_values[i] - dist_values[i-1]
        else:
            cur_dist = dist_values[i]
        running_sum += force_values[i]*cur_dist
        to_return.append(running_sum)
    return to_return

#########################################################################################################################################################

class ConsumptionPart:
    def __init__(self, mass_locomotive, mass_wagon, points, max_velocities, filter_window_elev, filter_window_curve, acceleration_limit=None):
        # Input parameters
        self.mass_locomotive = mass_locomotive
        self.mass_wagon = mass_wagon
        self.points = points
        self.max_velocities = max_velocities
        self.filter_window_elev = filter_window_elev
        self.filter_window_curve = filter_window_curve
        self.acceleration_limit = acceleration_limit

        self.curve_res_force_all_l = []
        self.curve_res_force_all_w = []
        self.force_values = []
        self.exerted_force_values = []
        self.dist_values = []
        self.velocity_values = []
        self.acceleration_values = []
        self.tangential_f_values = []
        self.parallel_f_values = []
        self.running_res_f_values = []
        self.curve_res_f_values = []

    def get_curve_resistance_force(self):
        # Curve forces
        for i in range(len(self.points)):
            if i % 3 == 0:
                if i+2 < len(self.points):
                    curve_res_force_l = calc_curve_resistance_force(self.points[i], self.points[i+1], self.points[i+2], self.mass_locomotive)/3
                    curve_res_force_w = calc_curve_resistance_force(self.points[i], self.points[i+1], self.points[i+2], self.mass_wagon)/3
                else:
                    curve_res_force_l = 0
                    curve_res_force_w = 0
            self.curve_res_force_all_l.append(curve_res_force_l)
            self.curve_res_force_all_w.append(curve_res_force_w)

        # Don't filter if windows == 0
        if self.filter_window_curve <= 0:
            return

        self.curve_res_force_all_l = savgol_filter(self.curve_res_force_all_l, self.filter_window_curve, 0, mode="nearest")
        self.curve_res_force_all_w = savgol_filter(self.curve_res_force_all_w, self.filter_window_curve, 0, mode="nearest")

    def slow_down_to_max_limit_six(self, max_velocity, slow_point_index):
        end_force = []
        end_exerted_force = []
        end_velocity = [max_velocity]
        deceleration_values = []
        curve_res_force_l = 0
        curve_res_force_w = 0
        # debug:
        tangential_f_values = []
        parallel_f_values = []
        running_res_f_values = []
        curve_res_f_values = []
            
        for i in range(slow_point_index,0,-1):
            immediate_distance = calc_distance_two_points(self.points[i], self.points[i-1])
            angle_cos, slope_distance = get_elevation_slope_cos(self.points[i-1], self.points[i], immediate_distance)
            angle_sin = get_elevation_slope_sin(self.points[i-1], self.points[i], immediate_distance)[0]
            
            # Forces on locomotive
            tangential_force_l = calc_tangential_force(self.mass_locomotive, angle_cos, end_velocity[-1])
            parallel_g_force_l = calc_parallel_g_force(self.mass_locomotive, angle_sin)
            running_res_force_l = calc_running_resistance_force(end_velocity[-1], self.mass_locomotive)
            
            # Forces on wagon
            parallel_g_force_w = calc_parallel_g_force(self.mass_wagon, angle_sin)
            running_res_force_w = calc_running_resistance_force(end_velocity[-1], self.mass_wagon)
            
            # Curve forces
            curve_res_force_l = self.curve_res_force_all_l[i]
            curve_res_force_w = self.curve_res_force_all_w[i]
            
            # Is it incline/decline?
            if self.points[i-1][2] - self.points[i][2] > 0: # Incline
                # print("incline")
                final_force = tangential_force_l - parallel_g_force_l - parallel_g_force_w - running_res_force_l - running_res_force_w
            else: # Decline
                # print("decline")
                final_force = tangential_force_l + parallel_g_force_l + parallel_g_force_w - running_res_force_l - running_res_force_w
            final_force += - curve_res_force_l - curve_res_force_w
            exerted_force = tangential_force_l
            acceleration = calc_acceleration(final_force, self.mass_locomotive+self.mass_wagon)
            # NOTE: If acceleration exceeds the limit, we'll just cap it
            if self.acceleration_limit is not None and acceleration > self.acceleration_limit:
                acceleration = self.acceleration_limit
            new_velocity = calc_velocity(acceleration, slope_distance, end_velocity[-1])
            
            if len(end_force) > 0:
                end_velocity.append(new_velocity)
            end_force.append(-final_force) # NOTE: Braking force has opposite direction
            end_exerted_force.append(-exerted_force)
            deceleration_values.append(-acceleration) # NOTE: Deceleration has opposite direction
            # debug:
            tangential_f_values.append(tangential_force_l)
            parallel_f_values.append(parallel_g_force_l+parallel_g_force_w)
            running_res_f_values.append(running_res_force_l+running_res_force_w)
            curve_res_f_values.append(curve_res_force_l+curve_res_force_w)
                
            if new_velocity >= self.velocity_values[i]:
                new_velocity = self.velocity_values[i]
                acceleration = calc_reverse_acceleration(end_velocity[-1], slope_distance, new_velocity) # Velocities are in 'reverse' order here (compared to next function)
                reverse_force = calc_force(self.mass_locomotive+self.mass_wagon, -acceleration)
                exerted_force -= final_force-reverse_force
                final_force = reverse_force
                
                end_velocity[-1] = new_velocity
                end_force[-1] = final_force # NOTE: Force here already has opposite direction (from reverse_force)
                end_exerted_force[-1] = -exerted_force
                deceleration_values[-1] = -acceleration
                break
        return end_force, end_exerted_force, end_velocity, deceleration_values, tangential_f_values, parallel_f_values, running_res_f_values, curve_res_f_values

    def get_ramp_up_six(self):
        self.force_values = [0]
        self.exerted_force_values = [0]
        self.velocity_values = [0]
        self.dist_values = [0]
        self.acceleration_values = [0]
        velocity_reached = False
        # debug:
        self.tangential_f_values = [0]
        self.parallel_f_values = [0]
        self.running_res_f_values = [0]
        self.curve_res_f_values = [0]
        
        for i in range(len(self.points)-1):
            immediate_distance = calc_distance_two_points(self.points[i], self.points[i+1])
            angle_cos, slope_distance = get_elevation_slope_cos(self.points[i], self.points[i+1], immediate_distance)
            angle_sin = get_elevation_slope_sin(self.points[i], self.points[i+1], immediate_distance)[0]
            
            # Forces on locomotive
            tangential_force_l = calc_tangential_force(self.mass_locomotive, angle_cos, self.velocity_values[-1])
            parallel_g_force_l = calc_parallel_g_force(self.mass_locomotive, angle_sin)
            running_res_force_l = calc_running_resistance_force(self.velocity_values[-1], self.mass_locomotive)
            
            # Forces on wagon
            parallel_g_force_w = calc_parallel_g_force(self.mass_wagon, angle_sin)
            running_res_force_w = calc_running_resistance_force(self.velocity_values[-1], self.mass_wagon)
            
            # Curve forces
            curve_res_force_l = self.curve_res_force_all_l[i]
            curve_res_force_w = self.curve_res_force_all_w[i]
            
            if velocity_reached and self.max_velocities[i] > self.max_velocities[i-1]:
                velocity_reached = False
            
            if not velocity_reached:
                # Is it incline/decline?
                if self.points[i+1][2] - self.points[i][2] > 0: # Incline
                    final_force = tangential_force_l - parallel_g_force_l - parallel_g_force_w - running_res_force_l - running_res_force_w
                else: # Decline
                    final_force = tangential_force_l + parallel_g_force_l + parallel_g_force_w - running_res_force_l - running_res_force_w
                final_force += - curve_res_force_l - curve_res_force_w
                acceleration = calc_acceleration(final_force, self.mass_locomotive+self.mass_wagon)
                # NOTE: If acceleration exceeds the limit, we'll just cap it
                if self.acceleration_limit is not None and acceleration > self.acceleration_limit:
                    acceleration = self.acceleration_limit
                new_velocity = calc_velocity(acceleration, slope_distance, self.velocity_values[-1])
                # print(acceleration, slope_distance, final_force, points[i+1][2] - points[i][2] > 0, curve_res_force_l + curve_res_force_w)
                exerted_force = tangential_force_l
                # Clamp it down, but only if the limit is the same (otherwise we could be clamping by A LOT)
                if new_velocity > self.max_velocities[i] and self.max_velocities[i] == self.max_velocities[i-1]:
                    new_velocity = self.max_velocities[i]
                    acceleration = calc_reverse_acceleration(new_velocity, slope_distance, self.velocity_values[-1])
                    reverse_force = calc_force(self.mass_locomotive+self.mass_wagon, acceleration)
                    exerted_force -= final_force-reverse_force
                    final_force = reverse_force
                    velocity_reached = True
                    
                # debug:
                self.tangential_f_values.append(tangential_force_l)
                self.parallel_f_values.append(parallel_g_force_l+parallel_g_force_w)
                self.running_res_f_values.append(running_res_force_l+running_res_force_w)
                self.curve_res_f_values.append(curve_res_force_l+curve_res_force_w)
            else:
                new_velocity = self.velocity_values[-1]
                # NOTE: when surface is not flat, we need to exert force to keep our speed
                # Is it incline/decline?
                if self.points[i+1][2] - self.points[i][2] > 0: # Incline
                    final_force = parallel_g_force_l + parallel_g_force_w + running_res_force_l + running_res_force_w + curve_res_force_l + curve_res_force_w
                else: # Decline
                    final_force = -parallel_g_force_l - parallel_g_force_w + running_res_force_l + running_res_force_w + curve_res_force_l + curve_res_force_w
                acceleration = 0 # NOTE: If no change in speed, acceleration is ZERO
                exerted_force = final_force
                
                # debug:
                self.tangential_f_values.append(0)
                self.parallel_f_values.append(parallel_g_force_l+parallel_g_force_w)
                self.running_res_f_values.append(running_res_force_l+running_res_force_w)
                self.curve_res_f_values.append(curve_res_force_l+curve_res_force_w)
                
            self.force_values.append(final_force)
            self.exerted_force_values.append(exerted_force)
            self.velocity_values.append(new_velocity)
            self.acceleration_values.append(acceleration)
            self.dist_values.append(self.dist_values[-1]+slope_distance)
        
            # print("nv", new_velocity, "mv", max_velocities[i])
            if new_velocity > self.max_velocities[i]:
                end_force_slow, end_exerted_force_slow, end_velocity_slow, deceleration_values_slow, end_tangential_f_values, end_parallel_f_values, end_running_res_f_values, end_curve_res_f_values = self.slow_down_to_max_limit_six(self.max_velocities[i], i)
                for j in range(len(end_velocity_slow)):
                    self.force_values[-j-1] = end_force_slow[j]
                    self.exerted_force_values[-j-1] = end_exerted_force_slow[j]
                    self.velocity_values[-j-1] = end_velocity_slow[j]
                    self.acceleration_values[-j-1] = deceleration_values_slow[j]
                    self.tangential_f_values[-i-1] = end_tangential_f_values[j]
                    self.parallel_f_values[-i-1] = end_parallel_f_values[j]
                    self.running_res_f_values[-i-1] = end_running_res_f_values[j]
                    self.curve_res_f_values[-i-1] = end_curve_res_f_values[j]

    def run(self):
        # Manually filter elevation values
        if self.filter_window_elev > 0:
            elevation = [x[2] for x in self.points]
            filtered = savgol_filter(elevation, self.filter_window_elev, 0, mode="nearest")
            self.points = [[x[0], x[1], filtered[i]] for i,x in enumerate(self.points)]

        # Calculate all curve resistance force ahead of time
        self.get_curve_resistance_force()

        # The master calculation
        self.get_ramp_up_six()

        # Braking (going backwards)
        end_force, end_exerted_force, end_velocity, deceleration_values, end_tangential_f_values, end_parallel_f_values, end_running_res_f_values, end_curve_res_f_values = self.slow_down_to_max_limit_six(0, len(self.points)-1)
        for i in range(len(end_velocity)):
            self.force_values[-i-1] = end_force[i]
            self.exerted_force_values[-i-1] = end_exerted_force[i]
            self.velocity_values[-i-1] = end_velocity[i]
            self.acceleration_values[-i-1] = deceleration_values[i]
            self.tangential_f_values[-i-1] = end_tangential_f_values[i]
            self.parallel_f_values[-i-1] = end_parallel_f_values[i]
            self.running_res_f_values[-i-1] = end_running_res_f_values[i]
            self.curve_res_f_values[-i-1] = end_curve_res_f_values[i]

class PlotData:
    def __init__(self, name, pretty_name):
        self.name = name
        self.pretty_name = pretty_name
        self.plot_obj = None

    def set_plot_obj(self, plot_obj):
        self.plot_obj = plot_obj

class Consumption:
    def __init__(self, file_path):
        # Params
        self.mass_locomotive = 80000 # kg (80 t)
        self.mass_wagon = 1000000 # kg (1000 t)
        self.filter_window_elev = 100
        self.filter_window_curve = 10
        self.acceleration_limit = None

        # Internal data
        self.file_path = file_path
        self.points = None
        self.stations = None
        self.max_velocities_in_mps = None

        self.clean()
        self.load_from_file()

    def load_from_file(self):
        with open(self.file_path) as f:
            lines = f.readlines()
            geojson_raw = "".join(lines)
            self.points = parse_points_from_geojson(geojson_raw)
            self.stations = parse_stations_from_geojson(geojson_raw)
            max_velocities = parse_max_velocity_from_geojson(geojson_raw)
            self.max_velocities_in_mps = [x/3.6 for x in max_velocities]

    def get_plot_data(self, name):
        if name == "acceleration":
            return self.acceleration_values
        elif name == "velocity":
            return self.velocity_values
        elif name == "force":
            return self.force_values
        elif name == "exerted_force":
            return self.exerted_force_values
        elif name == "tangential_force":
            return self.tangential_f_values
        elif name == "parallel_f_values":
            return self.parallel_f_values
        elif name == "running_res_f_values":
            return self.running_res_f_values
        elif name == "curve_res_f_values":
            return self.curve_res_f_values
        elif name == "energy_from_exerted_force":
            return self.energy_from_exerted_force

    def set_plot_data(self, plot_data: PlotData):
        plot_data.plot_obj.set_ydata(self.get_plot_data(plot_data.name))

    def clean(self):
        self.force_values = []
        self.exerted_force_values = []
        self.dist_values = []
        self.velocity_values = []
        self.acceleration_values = []
        self.tangential_f_values = []
        self.parallel_f_values = []
        self.running_res_f_values = []
        self.curve_res_f_values = []  
        self.energy_from_exerted_force = []
    
    def run(self):
        station_offset = 1
        prev_dist_offset = 0
        for i in range(len(self.stations)-1):
            if i == len(self.stations)-2:
                station_offset = 0
            
            split_points = self.points[self.stations[i]:self.stations[i+1]-station_offset+1]
            split_max_velocities_in_mps = self.max_velocities_in_mps[self.stations[i]:self.stations[i+1]-station_offset+1]

            consumption_part = ConsumptionPart(self.mass_locomotive, self.mass_wagon, split_points, split_max_velocities_in_mps, self.filter_window_elev, self.filter_window_curve, self.acceleration_limit)
            consumption_part.run()

            self.force_values += consumption_part.force_values
            self.exerted_force_values += consumption_part.exerted_force_values
            self.dist_values += [d+prev_dist_offset for d in consumption_part.dist_values]
            self.velocity_values += consumption_part.velocity_values
            self.acceleration_values += consumption_part.acceleration_values
            self.tangential_f_values += consumption_part.tangential_f_values
            self.parallel_f_values += consumption_part.parallel_f_values
            self.running_res_f_values += consumption_part.running_res_f_values
            self.curve_res_f_values += consumption_part.curve_res_f_values

            prev_dist_offset = self.dist_values[-1]

        self.energy_from_exerted_force = get_energy_from_force(self.exerted_force_values, self.dist_values)

def create_slider(label, min, max, init, fig, pos_left):
    axslider_window = fig.add_axes([pos_left, 0.18, 0.0225, 0.63])
    label = label.replace(" ", "\n")
    return Slider(
        ax=axslider_window,
        label=label,
        valmin=min,
        valmax=max,
        valinit=init,
        orientation="vertical"
    )
    

if __name__ == "__main__":
    c = Consumption("olo-opava.geojson")
    c.run()

    plots = [
        PlotData("acceleration", "Zrychlení (m/s2)"),
        PlotData("velocity", "Rychlost (m/s)"),
        PlotData("force", "Síla (N)"),
        PlotData("energy_from_exerted_force", "Energie z vydané síly (J)")
    ]

    fig, axs = plt.subplots(len(plots), figsize=(20,4), dpi=100, sharex=True)
    for i,p in enumerate(plots):
        plots[i].plot_obj, = axs[i].plot(c.dist_values, c.get_plot_data(p.name), label=p.pretty_name)
        axs[i].legend(loc="center left", bbox_to_anchor=(1, 0.5))
        if i == len(plots)-1:
            axs[i].set_xlabel("Vzdálenost (m)")
        # axs[i].set_ylabel(p.pretty_name)

    fig.subplots_adjust(left=0.20)
    sliders = [
        create_slider("Elevation smoothing", 0, 200, c.filter_window_elev, fig, 0.05),
        create_slider("Curve smoothing", 0, 200, c.filter_window_curve, fig, 0.1)
    ]

    def update(val):
        c.filter_window_elev = val
        c.clean()
        c.run()
        for p in plots:
            c.set_plot_data(p)
        fig.canvas.draw_idle()

    for s in sliders:
        s.on_changed(update)
    
    plt.show()
