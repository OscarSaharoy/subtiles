/* subdivide.c */
/* Description:
 * Reads a subdivision rule from a file (e.g., filename.r).
 * Reads a tiling of a quadrilateral from a file (e.g., filename.l0).
 * Subdivides the tiling according to the rules file and
 * writes the new tiling to a file (e.g., filename.l1).
 *
 * Copyright (c) 1997, 2000, 2008 James W. Cannon, William J. Floyd, and
 * Walter R. Parry
 *
 * This work was supported in part by National Science Foundation
 * grants DMS-9803868 and DMS-9971783.
 * 
 * This is free software and may be freely copied, modified, and
 * redistributed as noted below.
 *	The copyright notice must remain intact.
 *	Modifications must include a notice giving the reason
 * 	for the modification and including name and date.
 *	This is provided "as is" and comes with no warranty or
 * 	guarantee of fitness. Comments, bugs, and suggestions may be sent
 * 	to floyd@math.vt.edu.
 *
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#define MAXVALENCE 50
        /* The assumed maximal number of adjacencies to a tile
         * that is not an edge tile. */
        /* For the edge tiles we assume no more than nooftiles
         * as the maximum number of adjacencies.*/
#define MAXCYCLE 50
        /* The assumed maximal length in a vertex cycle. */

/* Variables for the old tiling.*/
int noofedges; /* Acts as size of *edges. */
int nooftiles; /* Acts as size of each of next three arrays.*/
int *facetype; /* Array, dynamically allocated: gives type of each tile.*/
int *facesize; /* Array: gives no of edges of each tile.*/
int *facebegin;/* Array: gives first edgeid associated with each tile.*/
int *edges;    /* Array: gives tileid adjacent across each edge of each tile.*/
               /* Since each tile has several edges, there are more edges than
                * tiles.*/

/* Variables for the new tiling. */ /* See comments for previous section.*/
int newnooftiles;
int *newfacetype;
int *newfacesize;
int *newfacebegin;
int *newedges;

/* Variables for the relationship between old and new tiling. */
int *firstnewtile; /* Array, of size nooftiles (from old tiling), which
                    * gives the tileid of the first new tile obtained by
                    * subdividing the old tile.*/
int *firstnewedge; /* Array, of size nooftiles (from old tiling), which
                    * gives the newedgeid of the first newedge corresponding
                    * to firstnewtile.*/

/* Variables for the new adjacency information.*/
int *vertex; /* Indexed by noofedges. */

/* Variables to describe an edge cycle.*/
int cyclelength;
int *tilecycle;
int *frontedge_cycle;
int *backedge_cycle;

/* Variables for the adjacency information for vertices. */
int noofverts, maxnoofverts; /* The number of vertices and an upper.
                              * bound for the number of vertices. */
int v;                       /* The number of the current vertex. */
int *noofvertadj; /* Array: vertadjsize[i] gives the number of vertices
                   * adjacent to vertex i. */
int **vertadj;    /* Array: vertadjac[i] gives the vertices adjacent to
                   * vertex i. */
int *vertused;    /* Array: entry is -1 if the adjacencies of a vertex hasn't
                   * been computed yet. */

/* Variables for the new adjacency information.*/
int *noofnewadj; /* Indexed by nooftiles.*/
int **newadj;    /* Indexed first by nooftiles, then by *noofnewadj.*/
int *edgeused;   /* Indexed by noofedges. Used to keep track of which
                  * edges have already been tested for cycles.*/

/* Variables to describe an edge cycle.*/
int cyclelength;
int *tilecycle;
int *frontedge_cycle;
int *backedge_cycle;

/* The following two sets of variables describe the subdivision rules.
 * They describe not one tiling, but a whole family of (small) tilings.
 * Hence they are doubly indexed. Refer to the comments above for
 * more information. */

/* Variables for the types. */
int nooftypes; /* Including the four standard end types. */
int *typenoofsides;
int *typenooftiles;
int **typefacetype;
int **typefacesize;
int **typefacebegin;
int **typeedges;

/* Array to give where new edges of the end types begin. */
int **newedgenumber;

/* Variables for the boundaries. These variables are only guaranteed
 * to be meaningful for the types > 3.*/
int *bdynoofoldedges;  /* corresponds to nooftiles */
/* int **bdyedgetype; what kind of edge is this?  We do not need to know. */
int **bdyedgesize;     /* The number of new edges of each original edge. */
int **bdyoldedgebegin; /* Index from old edges into two lists corresponding
  in 1-1 fashion to new edges. */
int **bdyfaces;        /* What face is adjacent to the new edge? */
int **bdyfaceedges;    /* What edge on that face is adjacent to the new edge? */

Readrules();
Readtiling();
Subdivide();
Writetilingtofile();
Readtypetiling();
Readbdytiling();
edgefromtiletotile();

main(argc, argv) int argc; char *argv[];
{
            Readrules();
            Readtiling();
            Subdivide();
            Writetilingtofile();
} /*end main() */
/******************* end main() ********************/

/* Readrules */
/* Description:
 * The text parts of the file are 1-string comments that will be ignored
 * but must be in the file.
 * Here is the format:

   Number_of_tile-types_(not_counting_the_four_standard_end_types):
   <number>
   Size_(i.e.,_number_of_edges)_of_each_of_these_types:
   <numbers>
   Subdivision-tiling:
   <format from Readtypetiling>
   Corresponding_boundary-tiling:
   <format from Readbdytiling>
   Subdivision-tiling:
   <format from Readtypetiling>
   Corresponding_boundary-tiling:
   <format from Readbdytiling>
   ... <iterate through all of the types other than end types>
   <any number of comments or extra data not to be used by the program>

  * The program does a fair amount of processing of these rules in order
  * to have indexes into the information.

 */

Readrules()
{   /* loop variables */
    int i,j,k;

    /* standard input variable and functions */
    char s[256];
    extern char *fgets();

FILE *fp;  /* move this to the variable declaration section */


fprintf(stderr," Read which rules file? (e.g., filename.r)\n");
fgets(s,sizeof(s),stdin);
s[strlen(s)-1]=s[strlen(s)];
if ((fp = fopen(s,"r")) == NULL)
{
  fprintf(stderr," cannot open file \n");
  exit(0);
}

/* Read number of tile types, nooftypes. */
    fscanf(fp," %s",s); /* Skip comment. */
    fscanf(fp," %d",&nooftypes); /* not counting the four standard
                                  * end types */
    nooftypes = nooftypes + 4;   /* Add in the four end types. */

/* Read no of edges on each type, *typenoofsides.*/
    /* Allocate membory for *typenoofsides.*/
    if((typenoofsides =
       (int *)malloc(nooftypes * sizeof(int))) ==
       NULL)
    {   fprintf(stderr,"allocation error - aborting\n");
exit(0);
    }
    /* Read sizes. */
    fscanf(fp," %s",s); /* Skip comment. */
    for( i = 4; i < nooftypes ; i++){ /* End sizes will be read later. */
fscanf(fp," %d",&j);
typenoofsides[i] = j;
    }/*endfor */

/* Alternate the reading of the subdivision-tilings and boundary-tilings.*/
    /* Allocate pointers to the arrays associated with the
     * subdivision tilings and the boundary tilings. */
    if((typenooftiles =
       (int *)malloc(nooftypes * sizeof(int))) ==
       NULL)
    {   fprintf(stderr,"allocation error - aborting\n");
exit(0);
    }
    for( i = 0; i < 4 ; i++){
typenooftiles[i] = 1;
    }/*endfor */
    if((typefacetype =
       (int **)malloc(nooftypes * sizeof(int *))) ==
       NULL)
    {   fprintf(stderr,"allocation error - aborting\n");
exit(0);
    }
    if((typefacesize =
       (int **)malloc(nooftypes * sizeof(int *))) ==
       NULL)
    {   fprintf(stderr,"allocation error - aborting\n");
exit(0);
    }
    if((typefacebegin =
       (int **)malloc(nooftypes * sizeof(int *))) ==
       NULL)
    {   fprintf(stderr,"allocation error - aborting\n");
exit(0);
    }
    if((typeedges =
       (int **)malloc(nooftypes * sizeof(int *))) ==
       NULL)
    {   fprintf(stderr,"allocation error - aborting\n");
exit(0);
    }
    if((newedgenumber =
       (int **)malloc(nooftypes * sizeof(int *))) ==
       NULL)
    {   fprintf(stderr,"allocation error - aborting\n");
exit(0);
    }
    if((bdynoofoldedges =
       (int *)malloc(nooftypes * sizeof(int))) ==
       NULL)
    {   fprintf(stderr,"allocation error - aborting\n");
exit(0);
    }
    if((bdyedgesize =
       (int **)malloc(nooftypes * sizeof(int *))) ==
       NULL)
    {   fprintf(stderr,"allocation error - aborting\n");
exit(0);
    }
    if((bdyoldedgebegin =
       (int **)malloc(nooftypes * sizeof(int *))) ==
       NULL)
    {   fprintf(stderr,"allocation error - aborting\n");
exit(0);
    }
    if((bdyfaces =
       (int **)malloc(nooftypes * sizeof(int *))) ==
       NULL)
    {   fprintf(stderr,"allocation error - aborting\n");
exit(0);
    }
    if((bdyfaceedges =
       (int **)malloc(nooftypes * sizeof(int *))) ==
       NULL)
    {   fprintf(stderr,"allocation error - aborting\n");
exit(0);
    }

    /* Read tilings. */
    for( i = 4; i < nooftypes ; i++){
Readtypetiling(fp);
Readbdytiling(fp);
    }/*endfor */

fclose(fp);
} /*end Readrules */

/******************* end Readrules ********************/

/* Readtiling */
/* Description:
 * The text portions of the format are 1-string comments that must
 * appear in the file.
 * The comments are read and discarded by fscanf as a single string.
 * The content of the comment lines is only to help those writing input
 * files.
 * Here is the format:

   Number_of_tiles_including_the_four_standard_ends:
   <number>
   Type_of_each_of_these_tiles:
   <numbers (no tile-number id is to be included)>
   Size_of_the_tiles)
   <numbers (no tile-number is is to be included)>
   Tile-ids_--_Adjacent_tiles_(in_correct_order_according_to_edge_number):
   <id number ... number>
   <id number ... number>
   ...
   <any number of comments or extra data not to be used by the program>

  * The program does a fair amount of processing of these rules in order
  * to have indexes into the information.

 */

Readtiling()
{   /* loop variables */
    int i,j,k,l,m;

    /* standard input variable and functions */
    char s[256];
    extern char *fgets();

FILE *fp;  /* move this to the variable declaration section */


fprintf(stderr," Read which tiling file? (e.g., filename.ln)\n");
fgets(s,sizeof(s),stdin);
s[strlen(s)-1]=s[strlen(s)];
if ((fp = fopen(s,"r")) == NULL)
{
  fprintf(stderr," cannot open file \n");
  exit(0);
}

/* Read nooftiles.*/
fscanf(fp," %s",s);/* Skip comment string.*/
fscanf(fp," %d",&nooftiles);

/* Read the types of each of the tiles( *facetype).*/
fscanf(fp," %s",s);/* Skip comment string. */
    if((facetype =
       (int *)malloc(nooftiles * sizeof(int))) ==
       NULL)
    {   fprintf(stderr,"allocation error - aborting\n");
exit(0);
    }
    for( i = 0; i < nooftiles ; i++){
fscanf(fp," %d",&l);
facetype[i] = l;
    }/*endfor */

/* Read the sizes of the end tiles. Since Readrules is supposed to be
called before Readtiling, the variable typenoofsides should at this point
already have had space allocated. */
fscanf(fp," %s",s);/* Skip comment string.*/
    for( i = 0; i < 4 ; i++){
fscanf(fp," %d",&l);
typenoofsides[i] = l;
    }/*endfor */
/* Read and discard the sizes of the other tiles. */
for(i = 4; i < nooftiles; i++){
   fscanf(fp," %d",&l);
}/* end for(i */

/* Before we can read the adjacency information on this tiling,
  we must calculate all of the size information. This information
  is kept in the arrays facesize and facebegin.*/

  /* Allocate space for the arrays. */
    if((facesize =
       (int *)malloc(nooftiles * sizeof(int))) ==
       NULL)
    {   fprintf(stderr,"allocation error - aborting\n");
exit(0);
    }
    if((facebegin =
       (int *)malloc(nooftiles * sizeof(int))) ==
       NULL)
    {   fprintf(stderr,"allocation error - aborting\n");
exit(0);
    }

  /* Calculate the arrays. */
     /* Calculate facesize.*/
    for( i = 0; i < nooftiles ; i++){
j = facetype[i];
facesize[i]=typenoofsides[j];
    }/*endfor */

    /* Calculate facebegin.*/
    facebegin[0] = 0;
    for( i = 0; i < nooftiles -1  ; i++){
facebegin[i+1] = facebegin[i]+facesize[i];
    }/*endfor */

/* For each tile read the id and the adjacent tiles.*/
fscanf(fp," %s",s);/* Skip comment string.*/

    /* Allocate space for edges.*/

/* Determine the number of edges. */
j = facebegin[nooftiles - 1] + facesize[nooftiles - 1];
    if((edges =
       (int *)malloc(j * sizeof(int))) ==
       NULL)
    {   fprintf(stderr,"allocation error - aborting\n");
exit(0);
    }

    /* Read the edges. */
    for( i = 0; i < nooftiles ; i++){
/* Read and discard id.*/
fscanf(fp," %d",&k);

/* Read the tiles adjacent to the given tile.*/
j = facesize[i];
for( k = 0; k < j ; k++){
    fscanf(fp," %d",&l);
    m = facebegin[i]+k;
    edges[m] = l;
}/*endfor */
    }/*endfor */

fclose(fp);

} /*end Readtiling */

/******************* end Readtiling ********************/

/* Readtypetiling */
/* Description:
 * Calls to this function will be interlaced with calls to
 * the function Readbdytiling. The first will read the subdivision
 * tiling corresponding to the subdivision of a type, the second
 * will read the corresponding boundary information used to piece
 * subdivisions together across boundaries.
 *
 * The text parts of the file are 1-line comments that will be ignored
 * but must be in the file. They must contain no spaces or carriage
 * returns.
 * Here is the format:

   Subdivision-tiling:
   Type_number_(the_first_one_should_be_4_since_the_ends_are_typed_0_1_2_3):
   <id-number>
   Number_of_tiles_into_which_that_tile_type_is_subdivided:
   <number>
   Type_of_each_of_these_tiles_in_the_subdivision:
   <numbers (no tile-number id is to be included)>
   Tile-ids_--_Adjacent_tiles_(in_correct_order_according_to_edge_number):
   <id number ... number>
   <id number ... number>
   ...

  * No comments should follow because the corresponding
  * boundary tiling will be read next.
  * The program does a fair amount of processing of these rules in order
  * to have indexes into the information.

 */

Readtypetiling(fp)
    FILE *fp;
{   /* loop variables */
    int i,j,k,l,m;

    int typeno;

    /* standard input variable and functions */
    char s[256];

/* Read the type number.  This is a local variable. The number is
 * already known externally.*/
fscanf(fp," %s",s); /* Skip comment. */
fscanf(fp," %s",s); /* Skip comment. */
fscanf(fp," %d",&typeno);

/* Read nooftiles into which that tile type is subdivided.*/
fscanf(fp," %s",s); /* Skip comment.*/
fscanf(fp," %d",&i);
typenooftiles[typeno]=i;

/* Read the type of each of the tiles
 * (into the array *(typefacetype[typeno]); space for this array has
 * not yet been allocated, though a pointer to this array should have
 * been allocated by Readrules, which calls Readtypetiling.) */
 /* Allocate the needed space: */
    if((typefacetype[typeno] =
       (int *)malloc(typenooftiles[typeno] * sizeof(int))) ==
       NULL)
    {   fprintf(stderr,"allocation error - aborting\n");
exit(0);
    }
 /* Read. */
    fscanf(fp," %s",s); /* Skip comment. */
    for( i = 0; i < typenooftiles[typeno] ; i++){
fscanf(fp," %d",&l);
typefacetype[typeno][i] = l;
    }/*endfor */

/* Before we can read the adjacency information on this tiling,
  we must calculate all of the size information. This information
  is kept in the arrays typefacesize[typeno] and typefacebegin[typeno].*/

  /* Allocate space for the arrays. */
    if((typefacesize[typeno] =
       (int *)malloc(typenooftiles[typeno] * sizeof(int))) ==
       NULL)
    {   fprintf(stderr,"allocation error - aborting\n");
exit(0);
    }
    if((typefacebegin[typeno] =
       (int *)malloc(typenooftiles[typeno] * sizeof(int))) ==
       NULL)
    {   fprintf(stderr,"allocation error - aborting\n");
exit(0);
    }

  /* Calculate the arrays. */
  /* Calculate typefacesize[typeno]. */
    for( i = 0; i < typenooftiles[typeno] ; i++){
j = typefacetype[typeno][i];
typefacesize[typeno][i]=typenoofsides[j];
    }/*endfor */

  /* Calculate typefacebegin[typeno]. */
    typefacebegin[typeno][0] = 0;
    for( i = 0; i < typenooftiles[typeno]-1 ; i++){
typefacebegin[typeno][i+1]=typefacebegin[typeno][i]
    +typefacesize[typeno][i];
    }/*endfor */


/* For each tile read the id and the adjacent tiles.*/

    /* Allocate space for edges.*/

/* Determine the number of edges. */
j = typefacebegin[typeno][typenooftiles[typeno] - 1]
 + typefacesize[typeno][typenooftiles[typeno] - 1];
    if((typeedges[typeno] =
       (int *)malloc(j * sizeof(int))) ==
       NULL)
    {   fprintf(stderr,"allocation error - aborting\n");
exit(0);
    }

    /* Read the edges. */
    fscanf(fp," %s",s); /* Skip comment. */
    for( i = 0; i < typenooftiles[typeno] ; i++){
/* Read and discard id.*/
fscanf(fp," %d",&k);

/* Read the tiles adjacent to the given tile.*/
j = typefacesize[typeno][i];
for( k = 0; k < j ; k++){
    fscanf(fp," %d",&l);
    m = typefacebegin[typeno][i]+k;
    typeedges[typeno][m] = l;
}/*endfor */
    }/*endfor */

} /*end Readtypetiling */

/******************* end Readtypetiling ********************/

/* Readbdytiling */
/* Description:
 * The text parts of the file are 1-string comments that will be ignored
 * but must be in the file.
 * Here is the format:

   Corresponding_boundary-tiling:
   Boundary_of_type_number_(the_first_should_be_4):
   <id-number>
   Number_of_edges_before_subdivision:
   <number>
   Number_of_edges_into_which_each_of_these_original_edges_is_subdivided:
   <numbers (no edge-number id is to be included)>
   Original_edgeid_-_numbers_in_pairs_for_subdivision_edges_(tileno_edgeno):
   <oldedgeid tileno edgeno tileno edgeno ...>
   <oldedgeid tileno edgeno tileno edgeno ...>
   <oldedgeid tileno edgeno tileno edgeno ...>
   ...

  * Comments may appear in any format after the last boundary tiling.
  * The program does a fair amount of processing of these
  * tilings in order
  * to have indexes into the information.

 */

Readbdytiling(fp)
    FILE *fp;
{   /* loop variables */
    int i,j,k,l,m;

    int typeno;
    int noofoldedges;

    /* standard input variable and functions */
    char s[256];

/* Read the type number.  This is a local variable. The number is
 * already known externally.*/
fscanf(fp," %s",s); /* Skip comment. */
fscanf(fp," %s",s); /* Skip comment. */
fscanf(fp," %d",&typeno);

/* Read number of edges before subdivision.*/
fscanf(fp," %s",s); /* Skip comment.*/
fscanf(fp," %d",&noofoldedges);
bdynoofoldedges[typeno]=noofoldedges;

/* Read the number of new edges into which each old edge is subdivided.
 * Put these numbers in the array *(bdyedgesize[typeno]).
 * Space for this array has
 * not yet been allocated, though a pointer to this array should have
 * been allocated by Readrules, which calls Readbdytiling.) */
 /* Allocate the needed space: */
    if((bdyedgesize[typeno] =
       (int *)malloc(noofoldedges * sizeof(int))) ==
       NULL)
    {   fprintf(stderr,"allocation error - aborting\n");
exit(0);
    }
 /* Read. */
    fscanf(fp," %s",s); /* Skip comment. */
    for( i = 0; i < noofoldedges; i++){
fscanf(fp," %d",&l);
bdyedgesize[typeno][i] = l;
    }/*endfor */

/* Create an index from old edges into new edges.
 * Put this index in the array *(bdyoldedgebegin[typeno]).
 * Space for this array has not yet been allocated, though a pointer
 * to this array should have been allocated by Readrules, which
 * calls Readbdytiling. */

 /* Allocate the space. */
    if((bdyoldedgebegin[typeno] =
       (int *)malloc(noofoldedges * sizeof(int))) ==
       NULL)
    {   fprintf(stderr,"allocation error - aborting\n");
exit(0);
    }

  /* Calculate the array. */
    bdyoldedgebegin[typeno][0] = 0;
    for( i = 1; i < noofoldedges ; i++){
bdyoldedgebegin[typeno][i] = bdyoldedgebegin[typeno][i-1]
    + bdyedgesize[typeno][i-1];
    }/*endfor */

/* For each old edge read the id and the adjacent-tile, edge pairs.*/

    /* Allocate space for two arrays.*/

/* Determine the size of the arrays. */
j = bdyoldedgebegin[typeno][noofoldedges-1]
    +bdyedgesize[typeno][noofoldedges - 1];
    if((bdyfaces[typeno] =
       (int *)malloc(j * sizeof(int))) ==
       NULL)
    {   fprintf(stderr,"allocation error - aborting\n");
exit(0);
    }
    if((bdyfaceedges[typeno] =
       (int *)malloc(j * sizeof(int))) ==
       NULL)
    {   fprintf(stderr,"allocation error - aborting\n");
exit(0);
    }

    /* Read the bdyfaces and bdyfaceedges. */
    fscanf(fp," %s",s); /* Skip comment. */
    for( i = 0; i < noofoldedges; i++){
/* Read and discard id.*/
fscanf(fp," %d",&k);

/* Read the tile-edge pairs.*/
j = bdyedgesize[typeno][i];
k = bdyoldedgebegin[typeno][i];
for( l = 0; l < j ; l++){
    fscanf(fp," %d",&m);
    bdyfaces[typeno][k+l] = m;
    fscanf(fp," %d",&m);
    bdyfaceedges[typeno][k+l] = m;
}/*endfor */
    }/*endfor */

} /*end Readbdytiling */

/******************* end Readbdytiling ********************/

/******************* begin subdivide ********************/

/* Subdivide */
/* Description:
 * Calculate the size and type information for the next layer,
 * including the ends and including the indexes into that
 * layer (firstnewedge(oldtile), firstnewtile(oldtile), newfacebegin(),
 * newfacetype(), newfacesize(), newnooftiles.
 *
 * Allocate memory for everything.
 *
 * Translate information from typetilings into each appropriate slot.
 *
 * Examine each edge of each old tile to find correct external-edge
 * adjacencies.
 */

Subdivide()
{   /* loop variables */
    int i,j,k;
    /* temporary variables */
    int a,b,c,d,e,f,g,h,m;
    /* edge and face variables for external adjacencies */
    int e1,e2,f1,f2;

    /* standard input variable and functions */
    char s[30];


/* Allocate space for *firstnewtile and *firstnewedge, the two variables
 * for the relationship bewteen the old and new tilings. */
if(( firstnewtile =
  ( int *) malloc( nooftiles * sizeof( int )))==NULL)
{  fprintf(stderr,"allocation arror - aborting.\n");
   exit(0);
}
if(( firstnewedge =
  ( int *) malloc( nooftiles * sizeof( int )))==NULL)
{  fprintf(stderr,"allocation error - aborting.\n");
   exit(0);
}

for( i = 0; i < 4 ; i ++ ){
 /* Allocate the needed space for the number of edges an edge divides
  * into: */
    if((newedgenumber[i] =
       (int *)malloc(nooftiles * 10 * sizeof(int))) ==
       NULL)
    {   fprintf(stderr,"allocation error - aborting\n");
exit(0);
    }
}

/* Compute the array firstnewtile. */
firstnewtile[0] = 0;
for( i = 1; i < nooftiles ; i ++ ){
   firstnewtile[i] = firstnewtile[i-1] + typenooftiles[facetype[i-1]];
}/* end for( i */

/* Compute the array firstnewedge. */
/* First compute firstnewedge for the standard end types. */
firstnewedge[0] = 0;
for(i = 0; i < 4; i++){
   newedgenumber[i][0] = 0;
   firstnewedge[i+1] = firstnewedge[i]; /* Initialize firstnewedge[i]. */
   a = facebegin[i];
   b = a + facesize[i];
   for(j = a; j < b; j++){ /*j indexes the edges adjacent to face i. */
      c = edges[j]; /*c is the id of a face adjacent to face i. */
      d = facebegin[c]; /*Find the edge of face c adjacent to face i.*/
      f = facetype[c];
e = edgefromtiletotile(c,i,j-a);
      /* Add the number of edges that side e is subdivided into to
       * newfirstedge[i+1] */
      /*   fprintf(stderr,"i = %d,c=%d,j-a=%d,e=%d\n",i,c,j-a,e); */
      firstnewedge[i+1] = firstnewedge[i+1] + bdyedgesize[f][e];
      newedgenumber[i][j-a+1] = firstnewedge[i+1]-firstnewedge[i];
  /* fprintf(stderr," newedgenumber[%d][%d] = %d\n",i,j-a+1,
   *  newedgenumber[i][j-a+1]); */
   }/* end for(j */
}/* end for(i */

/* Now compute firstnewedge for the remaining original tiles. */
c = nooftiles - 1;
for(i = 4; i < c; i++){
   firstnewedge[i+1] = firstnewedge[i]; /* Initialize firstnewedge[i+1]. */
   a = facetype[i]; /* a is the facetype of tile i. */
   b = typenooftiles[a]; /* b is the number of tiles it is subdivided
                          * into. */
   for (j = 0; j < b; j++){ /* Add to firstnewedge[i+1] the number of
                             * sides of each of the new tiles. */
       firstnewedge[i+1] = firstnewedge[i+1] + typefacesize[a][j];
   }/* end for(j */
}/* end for(i */

/* Compute newnooftiles. */
newnooftiles = 4; /* Initialize for the standard end types. */
for (i = 4; i < nooftiles; i++){
    a = facetype[i];
    newnooftiles = newnooftiles + typenooftiles[a];
}/* end for(i */

/* Allocate the arrays newfacetype, newfacesize and newfacebegin. */
if(( newfacetype =
  ( int *) malloc( newnooftiles * sizeof( int )))==NULL)
{  fprintf(stderr,"allocation arror - aborting.\n");
   exit(0);
}
if(( newfacesize =
  ( int *) malloc( newnooftiles * sizeof( int )))==NULL)
{  fprintf(stderr,"allocation error - aborting.\n");
   exit(0);
}
if(( newfacebegin =
  ( int *) malloc( newnooftiles * sizeof( int )))==NULL)
{  fprintf(stderr,"allocation error - aborting.\n");
   exit(0);
}

/* Calculate the arrays newfacetype, newfacesize and newfacebegin. */

/* First do the standard end types. */
for(i = 0; i < 4; i++){
   newfacetype[i] = i;
   newfacesize[i] = firstnewedge[i+1] - firstnewedge[i];
   newfacebegin[i] = firstnewedge[i];
}/* end for(i */

/* Now calculate the arrays for the remaining new tiles. */
for(i = 4; i < nooftiles; i++){
   c = firstnewtile[i]; /* First compute newfacebegin for the first tile
                         * in the subdivision of tile i. c is the number
                         * of this tile in the new tiling. */
   newfacebegin[c] = firstnewedge[i];
   a = facetype[i]; /* a is the facetype of tile i. */
   b = typenooftiles[a]; /* b is the number of tiles it is subdivided
                          * into. */
   for(j = 0; j < b; j++){
      newfacetype[c+j] = typefacetype[a][j];
      newfacesize[c+j] = typefacesize[a][j];
      if(j < b - 1){
        newfacebegin[c+j+1] = newfacebegin[c+j] + newfacesize[c+j];
      }/* end if(j */
   }/*end for(j */
}/* end for(i */

/* Allocate space for the new edges. */
/* First determine the number of new edges. */
a = newfacebegin[newnooftiles - 1] + newfacesize[newnooftiles - 1];
if(( newedges =
  ( int *) malloc( a * sizeof( int )))==NULL)
{  fprintf(stderr,"allocation error - aborting.\n");
   exit(0);
}

/* Put the information from the type tilings into newedges by translating
 * the appropriate information.  This will give the correct internal
 * adjacencies.  External adjacencies will be given by negative numbers,
 * to be corrected later. */

/* First put in -1's for each adjacency of one of the end types. */
for(j = 0; j < firstnewedge[4]; j++){
   newedges[j] = -1;
}/* end for(j */

/* Translate the typeedges for each original non-end tile into the
 * appropriate part of newedges. */
for(i = 4; i < nooftiles; i++){
   a = facetype[i];
   b = firstnewtile[i];
   c = firstnewedge[i];
   d = typenooftiles[a];
   e = typefacebegin[a][d-1] + typefacesize[a][d-1];
   for(j = 0; j < e; j++){
      /* Edges with negative entries correspond to external adjacencies
       * and their values are not shifted. Edges with nonnegative entries
       * correspond to internal adjacencies; their values are incremented
       * by b. */
      if( typeedges[a][j] < 0 ){
        newedges[c + j] = typeedges[a][j];
        } else{
        newedges[c + j] = b + typeedges[a][j];
      }/*end if */
   }/*end for(j */
}/*end for (i*/

/* Now change newedges to put in the external adjacencies.  This will
 * be done by going through the boundary data for each of the original
 * faces that are not end types.  Since a corresponding pair of entries
 * will be changed each time, there is no need to separately go through
 * the new edges of the standard end types. */
for(i=4; i < nooftiles; i++){ /* i indexes the non-end original tiles. */
   a = facetype[i];
   b = firstnewtile[i];
   c = facesize[i];
   for(j = 0; j < c; j++){ /* j indexes the sides of tile i. */
      d = bdyedgesize[a][j]; /* d is the number of new edges that edge
                              * j is subdivided into. */
      e = bdyoldedgebegin[a][j]; /* e is the index of the first edge in
                                  * the subdivision of the jth edge of
                                  * the tile i. */
      /* First check whether the edges in the subdivision of the jth edge
       * of tile i have already had their external adjacencies
       * corrected. */
      f = newfacebegin[b + bdyfaces[a][e]] + bdyfaceedges[a][e];
      if(newedges[f] < 0){ /* If they haven't been corrected, correct
                            * them. */
        g = edges[facebegin[i] + j]; /* g is the face adjacent to tile i
                                      * across edge j of tile i. */

        /* First do the case that g is one of the standard end types. */
        if(g < 4){
          h = newfacebegin[g] + newedgenumber[g][edgefromtiletotile(g,i,j)];

           for(k = 0; k < d; k++){
              /* f1 is the new face adjacent to the kth side of the
               * subdivision of the jth edge of face i. */
              f1 = b + bdyfaces[a][e+k];
              newedges[h+k] =  f1;
              /* e1 is the index in newedges of this edge of face f1. */
              e1 = newfacebegin[f1] + bdyfaceedges[a][e+k];
              newedges[e1] = g; /* Since the end type g is not
                                 * subdivided, the sides along the
                                 * subdivision of edge j all have faces
                                 * in the subdivision of face i
                                 * adjacent to face g. */
          }/*end for(k */

        } else { /* Now do the case that g is not an end type. */

          /* First find the edge of face g that is adjacent to face i.
           * This edge will be called m. */
m = edgefromtiletotile(g,i,j);

          /* Now correct the external adjacencies along edge j of face i
           * and along edge m of face g. */
          for(k = 0; k < d; k++){
              /* f1 is the new face adjacent to the kth side of the
               * subdivision of the jth edge of face i. */
              f1 = b + bdyfaces[a][e+k];
              /* e1 is the index in newedges of this edge of face f1. */
              e1 = newfacebegin[f1] + bdyfaceedges[a][e+k];
              /* f2 is the face adjacent to f1 along the kth side. */
              f2 = firstnewtile[g] +
                   bdyfaces[facetype[g]][bdyoldedgebegin[facetype[g]][m]
                   + d-1 -k];
              /* e2 is the index in newedges of this edge of face f2. */
              e2 = newfacebegin[f2]
  + bdyfaceedges[facetype[g]][bdyoldedgebegin[facetype[g]][m]+d-1-k];
             newedges[e1] = f2;
             newedges[e2] = f1;
           }/*end for (k */
        }/*end if(g */
      }/*end if(newedges */
   }/* end for(j */
}/*end for(i */


} /*end Subdivide */

/******************* end Subdivide *******************/



/* Writetilingtofile */
/* Description:
 * Write the new tiling to a file which could in turn be read as
 * an original tiling with the same subdivision rule.
 */

Writetilingtofile()
{   /* loop variables */
    int i,j,k,l,m;
    int linesize;

    /* standard input variable and functions */
    char s[256];
    extern char *fgets();

FILE *fp;  /* move this to the variable declaration section */

linesize = 8;
fprintf(stderr," Write which tiling file? (e.g., filename.ln+1)\n");
fgets(s,sizeof(s),stdin);
s[strlen(s)-1]=s[strlen(s)];
if ((fp = fopen(s,"w")) == NULL)
{
  fprintf(stderr," cannot open file \n");
  exit(0);
}

fprintf(fp,"Number_of_tiles_including_the_four_standard_ends:  \n");
fprintf(fp,"%d\n", newnooftiles);
fprintf(fp,"Type_of_each_of_these_tiles: \n");
    m = 0;
    for( i = 0; i < newnooftiles ; i++){
m++;
if( m == linesize
){
    m = 0;
    fprintf(fp,"\n");
}/*endif */
fprintf(fp," %d",newfacetype[i]);
    }/*endfor */
fprintf(fp," \n");
fprintf(fp,"Size_of_the_tiles:\n");
    m = 0;
    for( i = 0; i < newnooftiles ; i++){
m++;
if(m== linesize){
  m=0;
  fprintf(fp,"\n");
}/* end if */
fprintf(fp," %d",newfacesize[i]);
    }/*endfor */
fprintf(fp," \n");
fprintf(fp,"Tile-ids_--_Adjacent_tiles_in_correct_order):\n");
    for( i = 0; i < newnooftiles ; i++){
fprintf(fp,"%d",i);
j = newfacebegin[i];
m = 0;
for( k = 0; k < newfacesize[i] ; k++){
    m++;
    if( m == linesize
    ){
m = 0;
fprintf(fp,"\n");
    }/*endif */
    l = j + k;
    fprintf(fp," %d", newedges[l]);
}/*endfor */
fprintf(fp," \n");
    }/*endfor */
fclose(fp);
} /*end Writetilingtofile */

/******************* end Writetilingtofile ********************/


/* incr */
/* Description:
 * Return the next edge number in the clockwise direction.
 */
int incr(t,e)
    int t,e;
{   /* loop variables */
    int i,j,k;

    i = e+1;
    if( i == facesize[t]
    ){
        i = 0;
    }/*endif */

    return i;

} /*end incr */

/******************* end incr ********************/

/* decr */
/* Description:
 * Return the previous edge number in the clockwise direction.
 */
int decr(t,e)
    int t,e;
{   /* loop variables */
    int i,j,k;

    i = e-1;
    if( i == -1
    ){
        i = facesize[t] - 1;
    }/*endif*/

    return i;
} /* end decr */

/******************* end decr ********************/

/* edgefromtiletotile */
/* Description:
 * Return the edge number of tile t1 that is adjacent to tile t2
 * corresponding to edge e of tile t2.
 */
int edgefromtiletotile(t1,t2,e)
    int t1,t2,e;
{   /* loop variables */
    int i,j,k;
    /* edge variables to check whether t1 and t2 are incident in more
     * than one adjacent face. */
    int incre,decrj,eplus,jminus;
    i = facebegin[t1];
    j = 0;
    while( edges[i + j] != t2
    ){
        j++;
    }/*endwhile */
    incre = incr(t2,e);
    eplus=0;
    while (
    (edges[facebegin[t2] + incre] == t1)
     &&
    ((t2 > 3) || (incre > 0))
    ){  incre = incr(t2,incre);
         eplus++;
      }
    decrj = decr(t1,j);
    jminus=0;
    while (
    (edges[facebegin[t1] + decrj] == t2)
     &&
    ((t1 > 3) || (decrj < facesize[t1] - 1))
    ){
        decrj = decr(t1,decrj);
        jminus++;
    }
    if (eplus == jminus) {
        k = j;
    }
    if (eplus > jminus) {
        k = j;
        for (i=0; i < (eplus - jminus); i++) {
            k = incr(t1,k);
        }
    }
    if (eplus < jminus) {
        k = j;
        for (i=0; i < (jminus - eplus); i++) {
            k = decr(t1,k);
        }
    }
    return k;

} /*end edgefromtiletotile */

/******************* end edgefromtiletotile ********************/
