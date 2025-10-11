<?php
// This script creates a default category 'No Category' for every user upon signup
require_once __DIR__ . '/../config/db.php';

function createDefaultCategoryForUser($userId) {
    global $conn;
    // Check if 'No Category' already exists for this user
    $stmt = $conn->prepare("SELECT id FROM categories WHERE name = ? AND owner_id = ?");
    $defaultName = 'No Category';
    $stmt->bind_param('si', $defaultName, $userId);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows === 0) {
        // Insert default category
        $insert = $conn->prepare("INSERT INTO categories (name, owner_id) VALUES (?, ?)");
        $insert->bind_param('si', $defaultName, $userId);
        $insert->execute();
        $insert->close();
    }
    $stmt->close();
}

// Usage: Call this function after user signup
// createDefaultCategoryForUser($newUserId);
