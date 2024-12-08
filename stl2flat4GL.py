import struct
import json
import numpy as np
import sys

def calculate_normal(v1, v2, v3):
    """Calculate the normal of a triangle defined by vertices v1, v2, v3."""
    edge1 = np.subtract(v2, v1)
    edge2 = np.subtract(v3, v1)
    normal = np.cross(edge1, edge2)
    norm = np.linalg.norm(normal)
    return normal / norm if norm != 0 else normal

def parse_binary_stl(file_path):
    """Parse a binary STL file and return WebGL-ready JSON data."""
    vertices = []  # Flat list of vertex coordinates
    normals = []   # Flat list of vertex normals
    indices = []   # Indices for constructing triangles
    vertex_count = 0  # Track total vertex count for indexing

    with open(file_path, 'rb') as file:
        # Skip the 80-byte header
        file.seek(80)

        # Read the number of triangles (4-byte unsigned int)
        num_triangles = struct.unpack('<I', file.read(4))[0]

        for _ in range(num_triangles):
            # Read and ignore the STL normal (we'll calculate it ourselves)
            file.seek(12, 1)

            # Read the vertices of the triangle
            v1 = struct.unpack('<fff', file.read(12))
            v2 = struct.unpack('<fff', file.read(12))
            v3 = struct.unpack('<fff', file.read(12))

            # Calculate the flat normal for the triangle
            normal = calculate_normal(v1, v2, v3)

            # Add vertices and normals for each triangle
            for vertex in (v1, v2, v3):
                vertices.extend([round(vertex[0], 4), round(-vertex[1], 4), round(vertex[2], 4)])
                normals.extend([round(normal[0], 4), round(normal[1], 4), round(normal[2], 4)])

            # Add triangle indices (3 indices per triangle)
            indices.extend([vertex_count, vertex_count + 1, vertex_count + 2])
            vertex_count += 3

            # Skip the 2-byte attribute byte count
            file.seek(2, 1)

    return {"vertices": vertices, "normals": normals, "indices": indices}

def save_to_json(data, output_file):
    """Save the parsed data to a JSON file."""
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=4)

def main(stl_name, json_name):
    """Main function to process the STL file and save as JSON."""
    # Define base locations
    stl_file = f'/home/flash/Documents/Guns-n-Poses/stl/{stl_name}.stl'
    output_file = f'/home/flash/Documents/Guns-n-Poses/objects/{json_name}_flat.json'

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
