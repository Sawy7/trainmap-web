import pycrs

wkt_text = 'PROJCS["S-JTSK_Krovak_East_North",GEOGCS["GCS_unnamed",DATUM["D_unnamed",SPHEROID["Bessel_1841",6377397.155,299.152812800001]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Krovak"],PARAMETER["False_Easting",0.0],PARAMETER["False_Northing",0.0],PARAMETER["Pseudo_Standard_Parallel_1",78.5],PARAMETER["Scale_Factor",0.9999],PARAMETER["Azimuth",30.2881397222222],PARAMETER["Longitude_Of_Center",24.8333333333333],PARAMETER["Latitude_Of_Center",49.5],PARAMETER["X_Scale",-1.0],PARAMETER["Y_Scale",1.0],PARAMETER["XY_Plane_Rotation",90.0],UNIT["METER",1.0],TOWGS84[570.8,85.7,462.8,4.998,1.587,5.261,3.56]]'

proj4_text = pycrs.parse.from_esri_wkt(wkt_text).to_proj4()

print(proj4_text)

wkt_neue = pycrs.parse.from_proj4(proj4_text).to_esri_wkt()

#print(wkt_neue)
