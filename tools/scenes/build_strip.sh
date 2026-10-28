#!/bin/bash
# Usage: build_strip.sh <dir> <prefix> <full.jpg> <strip.jpg> shift1 shift2 ...
D=$1; P=$2; FULL=$3; STRIP=$4; shift 4
TOP=330; BOT=${BOT:-2280}; n=$#
inputs="-i $D/$P-00.png"; fs="[0]crop=1206:$((BOT-TOP)):0:$TOP[s0];"; ff="[0]crop=1206:$BOT:0:0[f0];"
i=1; for d in "$@"; do
  inputs="$inputs -i $D/$P-$(printf %02d $i).png"
  fs="$fs[$i]crop=1206:$d:0:$((BOT-d))[s$i];"
  if [ $i -eq $n ]; then ff="$ff[$i]crop=1206:$((2622-BOT+d)):0:$((BOT-d))[f$i];"; else ff="$ff[$i]split[x$i][y$i];[x$i]crop=1206:$d:0:$((BOT-d))[f$i];[y$i]nullsink;"; fi
  i=$((i+1)); done
ls=""; lf=""; for k in $(seq 0 $n); do ls="$ls[s$k]"; lf="$lf[f$k]"; done
ffmpeg -v error -y $inputs -filter_complex "${fs}${ls}vstack=$((n+1)),scale=750:-1" -q:v 3 "$STRIP"
ffmpeg -v error -y $inputs -filter_complex "${ff}${lf}vstack=$((n+1))" -q:v 2 "$FULL"
sips -g pixelHeight "$STRIP" "$FULL" | grep pixel
