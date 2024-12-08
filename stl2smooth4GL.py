#made using chatGPT

import struct
import json
import sys

def parse_binary_stl(file_path):
    vertices = []  # Flat list of vertex coordinates
    normals = []   # Flat list of vertex normals
    indices = []   # Indices for constructing triangles

    with open(file_path, 'rb') as file:
        # Skip the 80-byte header
        file.seek(80)

        # Read the number of triangles (4-byte unsigned int)
        num_triangles = struct.unpack('<I', file.read(4))[0]

        vertex_map = {}  # To deduplicate vertices and create indices
        vertex_count = 0

        for _ in range(num_triangles):
            # Read the normal vector
            nx, ny, nz = struct.unpack('<fff', file.read(12))

            # Process the 3 vertices of the triangle
            triangle_indices = []
            for _ in range(3):
                x, y, z = struct.unpack('<fff', file.read(12))
                vertex = (round(x, 4), round(-y, 4), round(z, 4))  # Negate Y for consistency

                if vertex not in vertex_map:
                    vertex_map[vertex] = vertex_count
                    vertices.extend(vertex)  # Add the vertex to the flat list
                    normals.extend([round(nx, 4), round(-ny, 4), round(nz, 4)])  # Add the normal to the flat list
                    vertex_count += 1

                triangle_indices.append(vertex_map[vertex])

            # Add indices for the current triangle
            indices.extend(triangle_indices)

            # Skip the attribute byte count (2 bytes)
            file.seek(2, 1)

    return {"vertices": vertices, "normals": normals, "indices": indices}

def save_to_json(data, output_file):
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=4)

# # Example usage
# stl_file = '/home/flash/Documents/Guns-n-Poses/stl/gunR.stl'
# output_file = '/home/flash/Documents/Guns-n-Poses/objects/gunGL.json'

# data = parse_binary_stl(stl_file)
# save_to_json(data, output_file)

# print(f"Model saved to {output_file} with WebGL-ready format (including normals).")

def main(stl_name, json_name):
    """Main function to process the STL file and save as JSON."""
    # Define base locations
    stl_file = f'/home/flash/Documents/Guns-n-Poses/stl/{stl_name}.stl'
    output_file = f'/home/flash/Documents/Guns-n-Poses/objects/{json_name}_smooth.json'

    # Parse and save
    data = parse_binary_stl(stl_file)
    save_to_json(data, output_file)

    print(f"Model saved to {output_file} with WebGL-ready format (flat shading).")
    print(f"Vertices: {len(data['vertices']) // 3}, Normals: {len(data['normals']) // 3}, Indices: {len(data['indices']) // 3}")

if __name__ == "__main__":
    # Ensure the script receives exactly 2 arguments
    if len(sys.argv) != 3:
        print("Usage: python script.py <stl_name> <json_name>")
        sys.exit(1)

    # Get STL and JSON names from command-line arguments
    stl_name = sys.argv[1]
    json_name = sys.argv[2]

    main(stl_name, json_name)

