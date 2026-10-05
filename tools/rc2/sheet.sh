#!/bin/bash
# usage: sheet.sh out.png cols file1.png file2.png ... (scales each to height 600 and tiles)
out=$1; cols=$2; shift 2; n=$#; inputs=(); fc=""; i=0
for f in "$@"; do inputs+=(-i "$f"); fc+="[$i:v]scale=-2:600[s$i];"; i=$((i+1)); done
rows=$(( (n+cols-1)/cols )); layout=""; for ((k=0;k<n;k++)); do c=$((k%cols)); r=$((k/cols)); layout+="${c}0_0|"; done
# use hstack per row then vstack
rowsf=""; for ((r=0;r<rows;r++)); do ids=""; cnt=0; for ((c=0;c<cols;c++)); do k=$((r*cols+c)); [ $k -lt $n ] && { ids+="[s$k]"; cnt=$((cnt+1)); }; done; if [ $cnt -eq 1 ]; then rowsf+="${ids}pad=iw*$cols:ih[r$r];"; else rowsf+="${ids}hstack=inputs=$cnt,pad=iw*$cols/$cnt:ih[r$r];"; fi; done
echo skip >/dev/null
fc+="$rowsf"; rr=""; for ((r=0;r<rows;r++)); do rr+="[r$r]"; done
if [ $rows -eq 1 ]; then fc+="${rr}null[o]"; else fc+="${rr}vstack=inputs=$rows[o]"; fi
ffmpeg -loglevel error -y "${inputs[@]}" -filter_complex "$fc" -map "[o]" -frames:v 1 "$out"
