/* tilepack.c */
/* Description:
 * Reads a tiling of a quadrilateral for a file (e.g., filename.ln)
 * and writes the assoiciated input file for CirclePack (e.g.,
 * filenameln.p).
 *
 * Copyright (c) 1997, 2000, 2008 James W. Cannon, William J. Floyd, and
 * Walter R. Parry
 *
 * This work was supported in part by National Science Foundation
 * grants DMS-9803868 and DMS-9971783.
 *
 * This is free software and may be freely copied, modified, and
 * redistributed as noted below.
 *      The copyright notice must remain intact.
 *      Modifications must include a notice giving the reason
 *      for the modification and including name and date.
 *      This is provided "as is" and comes with no warranty or
 *      guarantee of fitness. Comments, bugs, and suggestions may be sent
 *      to floyd@math.vt.edu.
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

main(argc, argv) int argc; char *argv[];
{
            Readtilingforvertex();
            Computevertexgraph();
            Writeforpacking();
} /*end main() */
/******************* end main() ********************/

/* incr */
/* Description:
 * Return the next edge number of a tile in the clockwise direction.
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
 * Return the previous edge number of a tile in the clockwise direction.
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


/* Readtilingforvertex */
/* Description:

 * This function is an exact copy of Readoldtiling -- EXCEPT THAT THE
 * SIZES ARE READ DIRECTLY FROM THE FILE RATHER THAN BEING DEDUCED
 * FROM TYPE INFORMATION. This difference allows one to work
 * directly with a tiling without reference to its type function
 * in those contexts where type does not play a role.

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
   Size_of_each_of_these_tiles:
   <numbers (no tile-number id is to be included)>
   Tile-ids_--_Adjacent_tiles_in_correct_order:
   <id number ... number>
   <id number ... number>
   ...
   (Any number of comments or extra data not to be used by the program>

  * The program does a fair amount of processing of these rules in order
  * to have indexes into the information.

 */

Readtilingforvertex()
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

/* Read and discard the type information. */
fscanf(fp," %s",s);/* Skip comment string.*/
for(i = 0; i < nooftiles; i++){
   fscanf(fp," %d", &l);
}/* end for(i */

/* Read the sizes of the tiles( *facesize).*/
fscanf(fp," %s",s);/* Skip comment string. */
    if((facesize =
       (int *)malloc(nooftiles * sizeof(int))) ==
       NULL)
    {   fprintf(stderr,"allocation error - aborting\n");
        exit(0);
    }
    for( i = 0; i < nooftiles ; i++){
        fscanf(fp," %d",&l);
        facesize[i] = l;
    }/*endfor */

/* Calculate the array *facebegin.*/
  /* Allocate space for the array. */

    if((facebegin =
       (int *)malloc(nooftiles * sizeof(int))) ==
       NULL)
    {   fprintf(stderr,"allocation error - aborting\n");
        exit(0);
    }

  /* Calculate the array. */

    /* Calculate facebegin.*/
    facebegin[0] = 0;
    for( i = 0; i < nooftiles -1  ; i++){
        facebegin[i+1] = facebegin[i]+facesize[i];
    }/*endfor */
    noofedges = facebegin[nooftiles - 1] + facesize[nooftiles - 1];

/* For each tile read the id and the adjacent tiles.*/
fscanf(fp," %s",s);/* Skip comment string.*/

    /* Allocate space for edges.*/

    if((edges =
       (int *)malloc(noofedges * sizeof(int))) ==
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

} /*end Readtilingforvertex */

/******************* end Readtilingforvertex ********************/

/* Computevertexgraph */
/* Description:
 * From the data of a tiling of a quadrilateral, this computes the
 * associated triangulation gotten by adding a barycenter to each face.
 * The purpose of this is to write an input file for CirclePack.
 */
#include <stdio.h>

Computevertexgraph()
{   /* loop variables */
    int i,j,k;

    /* standard input variable and functions */
    char s[256];

    /* tile and edge loop variables */
    int t,e;

/* Allocate space for variables. */

    if((vertex =
       (int *)malloc(noofedges * sizeof(int))) == NULL)
    {   fprintf(stderr,"allocation error 5 - aborting\n"); exit(0); }

    if((tilecycle =
       (int *)malloc(MAXCYCLE * sizeof(int))) == NULL)
    {   fprintf(stderr,"allocation error 6 - aborting\n"); exit(0); }

    if((frontedge_cycle =
       (int *)malloc(MAXCYCLE * sizeof(int))) == NULL)
    {   fprintf(stderr,"allocation error 7 - aborting\n"); exit(0); }

    if((backedge_cycle =
       (int *)malloc(MAXCYCLE * sizeof(int))) == NULL)
    {   fprintf(stderr,"allocation error 8 - aborting\n"); exit(0); }

/* Initialize the global variables not initialized by
 * Readoldtilingandsize. */
    for( i = 0; i < noofedges ; i++){
        vertex[i] = -1;
    }/*endfor */

/*  Give an upper bound to the number of vertices. */
    maxnoofverts = nooftiles + noofedges + 4;

/*  Allocate the variables for the vertex adjacencies. */
    if((noofvertadj =
       (int *)malloc(maxnoofverts * sizeof(int))) == NULL)
    {   fprintf(stderr,"allocation error 9 - aborting\n"); exit(0); }



    v = nooftiles;

    for(i = 0; i < nooftiles; i++){
        noofvertadj[i] = facesize[i];
    }/*end for*/


/* Process each vertex (indicated by oriented edge) provided
 * that that vertex has not already been processed.*/
    for( t = 0; t < nooftiles ; t++){ /* each tile */
        for( e = 0; e < facesize[t] ; e++){ /* each edge of that tile */
            /* Edge not already used?  i == 0*/
            i = vertex[facebegin[t]+e];
            if( i == -1
            ){
                Namevertex(t,e,v);
                v++;
            }/*endif */
        }/*endfor e = edge no*/
    }/*endfor t = tile no*/

noofverts = v;

    for(i = 0; i < nooftiles; i++){
       noofvertadj[i] = facesize[i];
    }/*end for */

/*  Allocate the variables for the vertex adjacencies. */
    if((vertadj =
       (int **)malloc(noofverts * sizeof(int *))) == NULL)
    {   fprintf(stderr,"allocation error 10 - aborting\n"); exit(0); }
    for(i = 0; i < noofverts; i++){
       if((vertadj[i] =
       (int *)malloc(noofvertadj[i] * sizeof(int))) == NULL)
    {  fprintf(stderr,"allocation error 11 - aborting\n"); exit(0);  }
    }/*end for(i*/
    if((vertused =
       (int *)malloc(noofverts * sizeof(int *))) == NULL)
    {   fprintf(stderr,"allocation error 10 - aborting\n"); exit(0); }

/*  Initialize the array vertused which determines whether vertadj[i] has
 *  already been computed. */
    for(i = 0; i < nooftiles; i++){
       vertused[i] = 01;
    }/*end for*/
    for(i = nooftiles; i < noofverts; i++){
       vertused[i] = -1;
    }/*end for*/


    for(i = 0; i < nooftiles; i++){
       for(j = 0; j < facesize[i]; j++){
          vertadj[i][j] = vertex[facebegin[i] + j];
       }/*end for*/
    }/*end for*/

/* Process each vertex to compute adjacencies provided
 * that that vertex has not already been processed.*/
    for( t = 0; t < nooftiles ; t++){ /* each tile */
        for( e = 0; e < facesize[t] ; e++){ /* each edge of that tile */
            /* Edge not already used?  i == 0*/
            v = vertadj[t][e];
            i = vertused[v];
            if( i == -1
            ){
                Findadjacencies(t,e,v);
            }/*endif */
        }/*endfor e = edge no*/
    }/*endfor t = tile no*/

} /*end Computevertexgraph */

/******************* end Computevertexgraph ********************/

/* Namevertex */
/* Description:
 * 
 */
Namevertex(t,e,v) /* t = tile, e = edge, v = new vertex */
    int t,e,v;
{   /* loop variables */
    int i,j,k,w;
    char s[256];

/* Initialize the cycle information. */
    cyclelength = 0;
    tilecycle[cyclelength] = t;
    backedge_cycle[cyclelength] = e;
    vertex[facebegin[t] + e] = v;

/* Add tiles to the cycle until the first tile or an edge tile
 * is reached. */
    do {
        cyclelength++;

        /* Calculate adjacent tile across backedge.*/
        tilecycle[cyclelength] =
            edges[facebegin[tilecycle[cyclelength - 1]] +
            backedge_cycle[cyclelength - 1]];

        /* If adjacent tile is not the ending tile...*/
        if(
            (tilecycle[cyclelength] > 3)
            &&
            (tilecycle[cyclelength] != tilecycle[0] )
        ){
            /* Calculate frontedge (adjacent to previous tile).*/
            frontedge_cycle[cyclelength] =
                edgefromtiletotile(tilecycle[cyclelength],
                   tilecycle[cyclelength-1],
                   backedge_cycle[cyclelength - 1]);

            /* Calculate backedge (clockwise around tile). */
            backedge_cycle[cyclelength] =
                incr(tilecycle[cyclelength],
                    frontedge_cycle[cyclelength]);

            /* Mark each backedge as it is used. */
            vertex[facebegin[tilecycle[cyclelength]] +
                backedge_cycle[cyclelength]] = v;
        }/*endif */

    }while(
            (tilecycle[cyclelength] > 3)
            &&
            (tilecycle[cyclelength] != tilecycle[0] )
    ); /*enddo */

    if(t < 4){
      noofvertadj[v] = 2 * cyclelength -1;
      }else{
      noofvertadj[v] = 2 * cyclelength + 1;
    }/*end if*/
    cyclelength++;

} /*end Namevertex */

/******************* end Namevertex ********************/

/* Findadjacencies */
/* Description:
 * starting with
 */
Findadjacencies(t,e,v) /* t = tile, e = edge, v = new vertex */
    int t,e,v;
{   /* loop variables */
    int i,j,k,w;
    int adjnumber;
    char s[256];

/* Initialize the cycle information. */
    cyclelength = 0;
    adjnumber = 0;
    tilecycle[cyclelength] = t;
    backedge_cycle[cyclelength] = e;
    vertused[v] = 0;

/* Add tiles to the cycle until the first tile or an edge tile
 * is reached. */
    do {
        cyclelength++;

        /* Calculate adjacent tile across backedge.*/
        tilecycle[cyclelength] =
            edges[facebegin[tilecycle[cyclelength - 1]] +
            backedge_cycle[cyclelength - 1]];

        /* If adjacent tile is not the ending tile...*/
        if(
            (tilecycle[cyclelength] > 3)
            &&
            (tilecycle[cyclelength] != tilecycle[0] )
        ){
            /* Calculate frontedge (adjacent to previous tile).*/
            frontedge_cycle[cyclelength] =
                edgefromtiletotile(tilecycle[cyclelength],
                   tilecycle[cyclelength-1],
                   backedge_cycle[cyclelength - 1]);

            /* Calculate backedge (clockwise around tile). */
            backedge_cycle[cyclelength] =
                incr(tilecycle[cyclelength],
                    frontedge_cycle[cyclelength]);

            vertadj[v][adjnumber] = vertadj[tilecycle[cyclelength]][
                frontedge_cycle[cyclelength]];
            adjnumber++;
            vertadj[v][adjnumber] = tilecycle[cyclelength];
            adjnumber++;
        }/*endif */

    }while(
            (tilecycle[cyclelength] > 3)
            &&
            (tilecycle[cyclelength] != tilecycle[0] )
    ); /*enddo */

    frontedge_cycle[cyclelength] =
        edgefromtiletotile(tilecycle[cyclelength],
           tilecycle[cyclelength - 1],
           backedge_cycle[cyclelength - 1]);
    vertadj[v][adjnumber] = vertadj[tilecycle[cyclelength]][
        frontedge_cycle[cyclelength]];
    adjnumber++;
    if(t > 3){
       vertadj[v][adjnumber] = tilecycle[cyclelength];
       adjnumber++;
       vertadj[v][adjnumber] = vertadj[v][0];
    }


} /*end Findadjacencies */

/******************* end Findadjacencies ********************/

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



/* Writeforpacking */
/* Description:
 * Write to file the vertex adjacenceny description of the tiling
 * in a format that can be read by Ken Stephenson's program, CirclePack. */

/* Here is the format.
    NODECOUNT: <number of vertices>

    GEOMETRY: <euclidean or hyperbolic>

    FLOWERS:
    <id nooffaces numbers (if an interior vertex, the first one is repeated)>
    ...
    <id nooffaces numbers (if an interior vertex, the first one is repeated)>*/

#include <stdio.h>

Writeforpacking()
{   /* loop variables */
    int i,j,k,l,m;
    int linesize;

    /* standard input variable and functions */
    char s[256];
    extern char *fgets();
    extern int atoi();

FILE *fp;  /* move this to the variable declaration section */

fprintf(stderr," Write which packinginput file? (e.g., filenameln.xmd)\n");
gets(s);
if ((fp = fopen(s,"w")) == NULL)
{
  fprintf(stderr," cannot open file \n");
  exit(0);
      }
k = nooftiles - 3;
fprintf(fp,"<CP_Scriptfile>\n  <CPscript title=\"%s\">\n",s);
fprintf(fp,"<cmd>act 0;infile_read %s.p;</cmd>\n",s);
fprintf(fp,"<text>Read the file into canvas 0.</text>\n");
fprintf(fp,"<cmd>repack;layout;disp -w -c;geom_to_e;</cmd>\n");
fprintf(fp,"<text>Pack the file, draw the circles, ");
fprintf(fp,"and change the geometry to euclidean.</text>\n");
fprintf(fp,"<cmd>set_aim 1.0 b;set_aim 0.5 %d %d %d %d</cmd>\n", k,k+facesize[0],k+facesize[0]+facesize[1],k+facesize[0]+facesize[1]+facesize[2]);
fprintf(fp,"<text>Set the boundary angles.</text>\n");
fprintf(fp,"<cmd>gamma %d;repack;fix; disp -w -c -e b; </cmd>\n",k + facesize[0]+facesize[1]+ facesize[2]/2);
fprintf(fp,"<text>Repack the file, and draw the circles and ");
fprintf(fp,"the boundary edges.</text>\n");
fprintf(fp,"<cmd>mark -cw -c a(%d,%d);disp -w -e m; </cmd>\n",nooftiles - 3, noofverts - 4);
fprintf(fp,"<text>Draw the edges corresponding to the tiling.</text>\n");
fprintf(fp,"\n");
fprintf(fp,"  </CPscript>\n  <CPdata>\n\n");
fprintf(fp,"<circlepacking name=\"%s.p\">\n",s);
fprintf(fp,"\n");
fprintf(fp,"NODECOUNT: ");
k = noofverts - 4;
fprintf(fp,"%d\n",k);
fprintf(fp,"\n");
fprintf(stderr,"Which geometry do you want to use?\n");
fprintf(stderr,"Enter 0 or <ret> for hyperbolic or anything else");
fprintf(stderr," for euclidean.\n");
gets(s);
l = atoi(s);
if(l==0){
   fprintf(fp,"GEOMETRY: hyperbolic\n");
 }else{
   fprintf(fp,"GEOMETRY: euclidean\n");
}/*end if(l*/
fprintf(fp,"\n");
fprintf(fp,"FLOWERS: \n");
    for( i = 4; i < nooftiles ; i++){
        fprintf(fp,"%d %d",i-3,facesize[i]);
        k = vertadj[i][0] - 3;
        fprintf(fp," %d",k);
        for(j = 0; j <facesize[i]; j++){
           k = vertadj[i][facesize[i] - 1 - j] - 3;
           fprintf(fp," %d",k);
        }/*end for(j*/
        fprintf(fp,"\n");
    }/*endfor */

    for( i = nooftiles; i < noofverts ; i++){
        fprintf(fp,"%d %d",i-3,noofvertadj[i]-1);
        for(j = 0; j <noofvertadj[i]; j++){
           k = vertadj[i][j] - 3;
           fprintf(fp," %d",k);
        }
        fprintf(fp," \n");
    }

fprintf(fp,"\n");
fprintf(fp,"END\n\n  </circlepacking>\n\n </CPdata>\n</CP_Scriptfile>\n");
fclose(fp);
} /*end Writeforpacking */


/******************* end Writeforpacking ***********************/
