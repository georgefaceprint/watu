#!/bin/bash
VERSION_FILE=".version"

# Set initial version if it doesn't exist
if [ ! -f "$VERSION_FILE" ]; then
    echo "1.0.01" > "$VERSION_FILE"
fi

current_version=$(cat "$VERSION_FILE")

# Extract major, minor, and patch components
major=$(echo "$current_version" | awk -F. '{print $1}')
minor=$(echo "$current_version" | awk -F. '{print $2}')
patch=$(echo "$current_version" | awk -F. '{print $3}')

# Increment the patch number and pad with leading 0 if needed
patch_number=$((10#$patch + 1))
new_patch=$(printf "%02d" "$patch_number")

# Construct the new version
new_version="${major}.${minor}.${new_patch}"

# Save the updated version back to the file
echo "$new_version" > "$VERSION_FILE"

commit_message="Watu Network V$new_version"

echo "Pushing changes with version $new_version..."
git add .
# We use || true in case there are no changes to commit
git commit -m "$commit_message" || true
git push

echo "Successfully pushed $commit_message!"
