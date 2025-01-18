#!/bin/bash



# Set the output directory for the markdown files
output_dir="_graphic_design"  # Change this to your desired directory
output_img_dir="assets/images/graphic_design"
input_dir="/Users/jzhou_private/Downloads/graphic design"
# Initialize the order counter
order=1
find "$input_dir" -name "*.*" -type f -print0 | while IFS= read -r -d '' file; do
  new_file=$(echo "$file" | awk '{gsub(/ /,"_"); print}')
  new_base_file=$(basename "$new_file")
  mv "$file" "$output_img_dir/$new_base_file"

  # Construct the markdown file path
  markdown_file="$output_dir/$(basename "$new_file" .png).md"  # Assumes .png extension, adjust if needed
  
  # Create the markdown content with dynamic image_path and order
  cat << EOF > "$markdown_file"
---
image_path: "/$output_img_dir/$new_base_file"
medium: "Digital Illustration - Procreate"
dimensions: 4000x3000px 
order: $order
featured: true
description:
  - something to talk about 
---

EOF

  # Increment the order counter
  order=$((order + 1))
done
