import os
import sys
from pathlib import Path
from datetime import datetime

# Define folders and files to ignore
IGNORE_FOLDERS = {
    '__pycache__',
    'migrations',
    'venv',
    'env',
    'node_modules'
}

def should_ignore(path):
    """Check if a path should be ignored based on our ignore rules"""
    name = os.path.basename(path)

    # Check if it's a hidden file/folder (starts with .)
    if name.startswith('.'):
        return True

    # Check if it's in our ignore list
    if name in IGNORE_FOLDERS:
        return True

    return False

def read_file_content(file_path):
    """Read and return the content of a file with proper error handling"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except UnicodeDecodeError:
        try:
            # Try different encoding if UTF-8 fails
            with open(file_path, 'r', encoding='latin-1') as f:
                return f"// Binary or non-UTF-8 file content (shown as latin-1):\n{f.read()}"
        except:
            return "// [BINARY FILE - CONTENT NOT READABLE]"
    except Exception as e:
        return f"// [ERROR READING FILE: {str(e)}]"

def generate_folder_tree_with_content(start_path, output_file, prefix="", is_last=True, is_root=True):
    """
    Recursively generate a folder tree structure with file contents

    Args:
        start_path: Path to the directory to scan
        output_file: File object to write output to
        prefix: Prefix string for tree visualization
        is_last: Whether this is the last item in the current level
        is_root: Whether this is the root directory
    """
    try:
        # Get all items in the directory and sort them (folders first, then files)
        items = os.listdir(start_path)

        # Filter out ignored items
        filtered_items = []
        for item in items:
            item_path = os.path.join(start_path, item)
            if not should_ignore(item_path):
                filtered_items.append(item)

        # Separate directories and files, then sort each alphabetically
        dirs = sorted([item for item in filtered_items if os.path.isdir(os.path.join(start_path, item))])
        files = sorted([item for item in filtered_items if os.path.isfile(os.path.join(start_path, item))])
        sorted_items = dirs + files

    except PermissionError:
        output_file.write(f"{prefix}└── 🔒 [Permission Denied]\n")
        return

    if not sorted_items:
        if is_root:
            output_file.write("📁 (Empty Directory)\n")
        return

    for index, item in enumerate(sorted_items):
        item_path = os.path.join(start_path, item)
        is_last_item = index == len(sorted_items) - 1

        # Determine the connector symbol
        if is_root and index == 0:
            connector = "📁 "
        elif is_last_item:
            connector = "└── "
        else:
            connector = "├── "

        # Choose appropriate icon and handle files/folders
        if os.path.isdir(item_path):
            icon = "📁 "
            line = f"{prefix}{connector}{icon}{item}"
            output_file.write(line + "\n")

            # If it's a directory, recurse into it
            extension = "    " if is_last_item else "│   "
            generate_folder_tree_with_content(
                item_path,
                output_file,
                prefix + extension,
                is_last_item,
                is_root=False
            )
        else:
            # It's a file - show file info
            try:
                file_size = os.path.getsize(item_path)
                size_str = f" ({file_size} bytes)" if file_size < 1024 else f" ({file_size/1024:.1f} KB)"
            except:
                size_str = " (size unknown)"

            icon = f"📄{size_str} "
            line = f"{prefix}{connector}{icon}{item}"
            output_file.write(line + "\n")

            # Write file path and content
            relative_path = os.path.relpath(item_path, start_path)
            output_file.write(f"{prefix}    📍 PATH: {item_path}\n")
            output_file.write(f"{prefix}    {'=' * 60}\n")

            # Read and write file content
            content = read_file_content(item_path)
            if content.strip():  # Only write content if file is not empty
                # Indent each line of content
                for content_line in content.split('\n'):
                    output_file.write(f"{prefix}    │ {content_line}\n")
            else:
                output_file.write(f"{prefix}    │ [EMPTY FILE]\n")

            output_file.write(f"{prefix}    {'=' * 60}\n\n")

def count_items(path):
    """Count total files and folders in the specified path, ignoring excluded items"""
    file_count = 0
    folder_count = 0

    for root, dirs, files in os.walk(path):
        # Filter out ignored directories to prevent walking into them
        dirs[:] = [d for d in dirs if not should_ignore(os.path.join(root, d))]

        # Count only non-ignored items
        folder_count += len(dirs)
        file_count += len([f for f in files if not should_ignore(os.path.join(root, f))])

    return folder_count, file_count

def get_folder_size(path):
    """Calculate total size of a folder, ignoring excluded items"""
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(path):
        # Filter out ignored directories to prevent walking into them
        dirnames[:] = [d for d in dirnames if not should_ignore(os.path.join(dirpath, d))]

        for filename in filenames:
            filepath = os.path.join(dirpath, filename)
            if not should_ignore(filepath):
                try:
                    total_size += os.path.getsize(filepath)
                except:
                    continue
    return total_size

def main():
    # Get target folder from command line argument
    if len(sys.argv) < 2:
        print("Usage: python print.py <folder_name>")
        print("Example: python print.py src")
        return 1

    target_folder = sys.argv[1]

    # Resolve the absolute path
    if os.path.isabs(target_folder):
        target_path = target_folder
    else:
        target_path = os.path.abspath(target_folder)

    # Check if the path exists
    if not os.path.exists(target_path):
        print(f"Error: The path '{target_path}' does not exist.")
        return 1

    if not os.path.isdir(target_path):
        print(f"Error: '{target_path}' is not a directory.")
        return 1

    # Generate output filename based on the folder name
    folder_name = os.path.basename(target_path.rstrip('/\\'))
    output_filename = f"{folder_name}_content_tree.txt"

    print(f"🌳 Generating folder tree with content for: {target_path}")
    print(f"💾 Output will be saved to: {output_filename}")
    print(f"🚫 Ignoring: {', '.join(IGNORE_FOLDERS)} and all hidden files/folders")

    try:
        with open(output_filename, 'w', encoding='utf-8') as output_file:
            # Write header
            output_file.write("=" * 80 + "\n")
            output_file.write(f"FOLDER CONTENT TREE: {os.path.basename(target_path)}\n")
            output_file.write("=" * 80 + "\n\n")

            output_file.write(f"📁 Target Directory: {target_path}\n")
            output_file.write(f"📅 Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

            # Calculate statistics for the target folder only (excluding ignored items)
            folder_count, file_count = count_items(target_path)
            total_size = get_folder_size(target_path)

            output_file.write(f"📊 Statistics: {folder_count} folders, {file_count} files")
            if total_size < 1024:
                output_file.write(f", {total_size} bytes\n")
            elif total_size < 1024*1024:
                output_file.write(f", {total_size/1024:.1f} KB\n")
            else:
                output_file.write(f", {total_size/(1024*1024):.1f} MB\n")

            # List what's being ignored
            output_file.write(f"🚫 Ignored folders/files: {', '.join(IGNORE_FOLDERS)} and all hidden files/folders\n")

            output_file.write("\n" + "=" * 80 + "\n")
            output_file.write("TREE STRUCTURE WITH FILE CONTENTS:\n")
            output_file.write("=" * 80 + "\n\n")

            # Generate the tree with file contents
            generate_folder_tree_with_content(target_path, output_file)

            # Write footer with summary
            output_file.write("\n" + "=" * 80 + "\n")
            output_file.write("SUMMARY\n")
            output_file.write("=" * 80 + "\n")
            output_file.write(f"Total folders scanned: {folder_count}\n")
            output_file.write(f"Total files scanned: {file_count}\n")
            output_file.write(f"Total size: {total_size} bytes\n")
            output_file.write(f"Generation completed: {datetime.now().strftime('%H:%M:%S')}\n")
            output_file.write(f"Ignored items: {', '.join(IGNORE_FOLDERS)} and all hidden files/folders\n")

        print(f"✅ Success! Folder content tree saved to '{output_filename}'")
        print(f"📊 Processed {folder_count} folders and {file_count} files")

        # Show preview of the output file
        print(f"\n📋 Preview of first 30 lines from '{output_filename}':")
        print("-" * 50)
        try:
            with open(output_filename, 'r', encoding='utf-8') as f:
                for i, line in enumerate(f):
                    if i < 30:  # Show first 30 lines
                        print(line.rstrip())
                    else:
                        break
                # Get total line count
                f.seek(0)
                total_lines = sum(1 for _ in f)
                print(f"... and {total_lines - 30} more lines")
        except Exception as e:
            print(f"(Preview not available: {e})")

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return 1

    return 0

if __name__ == "__main__":
    sys.exit(main())
