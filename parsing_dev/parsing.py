from typing import OrderedDict
import fiona

shape = fiona.open("Olc_Krn_Ova.shp")
print(shape.schema)
first = shape.next()
print(first)

