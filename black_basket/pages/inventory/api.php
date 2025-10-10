<?php
session_start();
header('Content-Type: application/json');
require_once '../../config/db.php';

// Check if user is logged in and has permission (simplified example)
if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
            if (isset($_GET['categories'])) {
            // Return all category names
            $cat_sql = "SELECT name FROM categories ORDER BY name ASC";
            $cat_res = $conn->query($cat_sql);
            $categories = [];
            while ($row = $cat_res->fetch_assoc()) {
                $categories[] = $row['name'];
            }
            echo json_encode($categories);
            break;
        }
        // ...existing code for products...
        $sql = "SELECT p.id, p.name, p.category, p.unit_price, i.quantity
                FROM products p
                LEFT JOIN inventory i ON p.id = i.product_id";
        $result = $conn->query($sql);
        $products = [];
        while ($row = $result->fetch_assoc()) {
            $products[] = $row;
        }
        echo json_encode($products);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
            exit;
        }
        $name = isset($data['name']) ? $conn->real_escape_string($data['name']) : '';
        if ($name === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Name is required']);
            exit;
        }
        $category = isset($data['category']) ? $conn->real_escape_string($data['category']) : '';
        // Accept 'variable' as a string for price, otherwise float
        if (isset($data['price']) && $data['price'] === 'variable') {
            $price = 'variable';
        } else if (isset($data['price']) && $data['price'] !== '') {
            $price = floatval($data['price']);
        } else {
            $price = null;
        }
        $cost = isset($data['cost']) && $data['cost'] !== '' ? floatval($data['cost']) : null;
        $track_stock = isset($data['track_stock']) ? intval($data['track_stock']) : 0;
        $in_stock = isset($data['in_stock']) && $data['in_stock'] !== '' ? intval($data['in_stock']) : 0;
        $low_stock = isset($data['low_stock']) && $data['low_stock'] !== '' ? intval($data['low_stock']) : 0;
        $pos_available = isset($data['pos_available']) ? intval($data['pos_available']) : 1;
        $type = isset($data['type']) ? $conn->real_escape_string($data['type']) : 'color_shape';
        $color = isset($data['color']) ? $conn->real_escape_string($data['color']) : '';
        $shape = isset($data['shape']) ? $conn->real_escape_string($data['shape']) : '';
        $image_url = isset($data['image_url']) ? $conn->real_escape_string($data['image_url']) : '';
        $variants = isset($data['variants']) ? $data['variants'] : [];
        $sku = isset($data['sku']) ? $conn->real_escape_string($data['sku']) : '';
        $barcode = isset($data['barcode']) ? $conn->real_escape_string($data['barcode']) : '';
        // If price is null, set to 'variable' (string)
    $price_sql = ($price === 'variable') ? "'variable'" : ($price !== null ? $price : 'NULL');

        $conn->begin_transaction();
        try {
            // Category: create if not exists
            $category_id = null;
            if ($category) {
                $cat_sql = "SELECT id FROM categories WHERE name='$category' LIMIT 1";
                $cat_res = $conn->query($cat_sql);
                if ($cat_res && $cat_res->num_rows > 0) {
                    $category_id = $cat_res->fetch_assoc()['id'];
                } else {
                    $cat_ins = "INSERT INTO categories (name) VALUES ('$category')";
                    if (!$conn->query($cat_ins)) throw new Exception($conn->error);
                    $category_id = $conn->insert_id;
                }
            }
            // Insert product
            $prod_sql = "INSERT INTO products (name, category_id, price, cost, sku, barcode, track_stock, in_stock, low_stock, pos_available, type, color, shape, image_url) VALUES ('"
                . $name . "', "
                . ($category_id ? $category_id : 'NULL') . ", "
                . $price_sql . ", "
                . ($cost !== null ? $cost : 'NULL') . ", '"
                . $sku . "', '"
                . $barcode . "', "
                . $track_stock . ", "
                . $in_stock . ", "
                . $low_stock . ", "
                . $pos_available . ", '"
                . $type . "', '"
                . $color . "', '"
                . $shape . "', '"
                . $image_url . "')";
            if (!$conn->query($prod_sql)) throw new Exception($conn->error);
            $product_id = $conn->insert_id;

            // Insert variants
            foreach ($variants as $variant) {
                $vname = $conn->real_escape_string($variant['name']);
                $vprice = floatval($variant['price']);
                $vcost = floatval($variant['cost']);
                $vin_stock = intval($variant['in_stock']);
                $vlow_stock = intval($variant['low_stock']);
                $vsku = $conn->real_escape_string($variant['sku']);
                $vbarcode = $conn->real_escape_string($variant['barcode']);
                $vpos_available = intval($variant['pos_available']);
                $var_sql = "INSERT INTO product_variants (product_id, name, price, cost, in_stock, low_stock, sku, barcode, pos_available) VALUES ("
                    . $product_id . ", '"
                    . $vname . "', "
                    . $vprice . ", "
                    . $vcost . ", "
                    . $vin_stock . ", "
                    . $vlow_stock . ", '"
                    . $vsku . "', '"
                    . $vbarcode . "', "
                    . $vpos_available . ")";
                if (!$conn->query($var_sql)) throw new Exception($conn->error);
            }

            $conn->commit();
            echo json_encode(['success' => true, 'product_id' => $product_id]);
        } catch (Exception $e) {
            $conn->rollback();
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?>
