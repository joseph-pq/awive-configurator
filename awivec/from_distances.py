import numpy as np
from scipy.linalg import eigh


def classical_mds(D, dim=2):
    # D is the distance matrix (n x n)
    n = D.shape[0]
    # Create centering matrix
    H = np.eye(n) - np.ones((n, n)) / n
    # Square the distances
    D_squared = D**2
    # Apply double centering
    B = -0.5 * H @ D_squared @ H
    # Eigen decomposition: since B is symmetric, we can use eigh
    eigvals, eigvecs = eigh(B)
    # Sort eigenvalues and eigenvectors in descending order
    idx = np.argsort(eigvals)[::-1]
    eigvals = eigvals[idx][:dim]
    eigvecs = eigvecs[:, idx][:, :dim]
    # Compute coordinates using the positive eigenvalues
    L = np.diag(np.sqrt(eigvals))
    X = eigvecs @ L
    return X


# Example: Suppose we have 4 points with the following distance matrix:
D = np.array(
    [
        [0, 3.7782, 19.3769, 20.6298],
        [3.7782, 0, 19.0869, 21.8399],
        [19.3769, 19.0869, 0, 8.3321],
        [20.6298, 21.8399, 8.3321, 0],
    ]
)

coords = classical_mds(D)
print("Coordinates of the 4 points:")
print(coords)
# bring all to 0
min_x = 0
min_y = 0
for coord in coords:
    min_x = min(coord[0], min_x)
    min_y = min(coord[1], min_y)
print(f"{min_x=}, {min_y}")
coords = list(
    map(
        lambda x: [float(round(x[0] - min_x, 2)), float(round(x[1] - min_y, 2))], coords
    )
)
print("updated")
for coord in coords:
    print(coord)
