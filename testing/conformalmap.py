#!/usr/bin/env python3

import matplotlib.pyplot as plt
import numpy as np


# define quad source and destination corners

src_corners = [
	( 1, 1),
	( 1,-1),
	(-1,-1),
	(-1, 1),
	( 0, 0),
]

dst_corners = [
	( -0.2, 0.2),
	( -0.2,-0.2),
	(-1,-1),
	(-1, 1),
	(-0.3,0),
]

src_corners = [
	(-0.0000056, - 0.8705255),
	(-0.9738002, + 0.8161359),
	(0.97378879, + 0.8161359),
]
dst_corners = [
	(0.97378636, + 0.81613371),
	(-0.0000069, + 0.81613368),
	(0.48688972, - 0.02719603),
]

# also some lines which can be used to visualise the transform

h_lines = [
	[ (x, y) for x in np.linspace( -1, 1, 100 ) ]
	for y in np.linspace( -1, 1, 10 )
]

v_lines = [
	[ (x, y) for y in np.linspace( -1, 1, 100 ) ]
	for x in np.linspace( -1, 1, 10 )
]

# map everything to complex

to_complex = lambda a, b : a + b * 1j

src_complexes = [ to_complex(*p) for p in src_corners ]
dst_complexes = [ to_complex(*p) for p in dst_corners ]

h_line_complexes = [
	[ to_complex(*p) for p in line ]
	for line in h_lines
]

v_line_complexes = [
	[ to_complex(*p) for p in line ]
	for line in v_lines
]


# mapping func from src to dst

map_func = lambda z, c0, c1, k1=0, c2=0, k2=0 : \
	( c0 + c1*z + c2*z**2 ) / ( 1 + k1*z + k2*z**2 )

# find constants by Ax = b
A_row = lambda z, zp : [ 1, z, -z*zp, z**2, -z**2*zp ][:3]
b_row = lambda z, zp : [ zp ]

A = np.array([ A_row(z, zp) for z, zp in zip( src_complexes, dst_complexes ) ])
b = np.array([ b_row(z, zp) for z, zp in zip( src_complexes, dst_complexes ) ])

x = np.linalg.solve( A, b )[:,0]
print( x )

# transform lines by map func

h_curve_complexes = [
	[ map_func( z, *x ) for z in line ]
	for line in h_line_complexes
]

v_curve_complexes = [
	[ map_func( z, *x ) for z in line ]
	for line in v_line_complexes
]

# and plot

src_x, src_y = zip( *src_corners )
dst_x, dst_y = zip( *dst_corners )

plt.scatter( src_x, src_y, label="source corners" )
plt.scatter( dst_x, dst_y, label="destination corners" )
plt.legend()

for curve in h_curve_complexes:
	curve_x, curve_y = zip( *[ (z.real, z.imag) for z in curve ] )
	plt.plot( curve_x, curve_y, color="black" )

for curve in v_curve_complexes:
	curve_x, curve_y = zip( *[ (z.real, z.imag) for z in curve ] )
	plt.plot( curve_x, curve_y, color="black" )

plt.show()

