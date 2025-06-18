<?php
// Configuration CORS complète
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: false");

// Gérer les requêtes preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dsn = 'mysql:host=localhost;dbname=stadefoot;charset=utf8';
$username = 'root';
$password = ''; 

try {
    $pdo = new PDO($dsn, $username, $password);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur DB']);
    exit;
}

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents("php://input"), true);

switch ($action) {
    case 'register':
        $stmt = $pdo->prepare("INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)");
        $hashed = password_hash($data['password'], PASSWORD_DEFAULT);
        $success = $stmt->execute([$data['name'], $data['email'], $data['phone'], $hashed]);
        echo json_encode(['success' => $success]);
        break;

    case 'login':
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($user && password_verify($data['password'], $user['password'])) {
            unset($user['password']);
            echo json_encode(['success' => true, 'user' => $user]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Email ou mot de passe incorrect']);
        }
        break;

    case 'reserve':
        $stmt = $pdo->prepare("INSERT INTO reservations (name, email, match_id, section, quantity, total_price) VALUES (?, ?, ?, ?, ?, ?)");
        $success = $stmt->execute([
            $data['name'],
            $data['email'],
            $data['match_id'],
            $data['section'],
            $data['quantity'],
            $data['total_price']
        ]);

        if (!$success) {
            echo json_encode(['success' => false, 'message' => 'Erreur lors de la réservation']);
            break;
        }

        $reservationId = $pdo->lastInsertId();

        // Récupérer les équipes du match
        $stmt = $pdo->prepare("SELECT home_team, away_team FROM matches WHERE id = ?");
        $stmt->execute([$data['match_id']]);
        $match = $stmt->fetch(PDO::FETCH_ASSOC);

        $matchName = isset($match['home_team'], $match['away_team']) 
            ? $match['home_team'] . " vs " . $match['away_team']
            : 'Match inconnu';

        // Préparer les données pour l'email
        $reservationData = [
            'match_name' => $matchName,
            'section' => $data['section'],
            'quantity' => $data['quantity'],
            'total_price' => $data['total_price'],
            'reservation_id' => $reservationId
        ];

        // Envoyer l'e-mail
        require_once 'emailService.php';

        $emailService = new EmailService();
        $mailSent = $emailService->sendReservationConfirmation($data['email'], $data['name'], $reservationData);

        echo json_encode(['success' => $success, 'mail_sent' => $mailSent]);
        break;



    case 'matches':
        $stmt = $pdo->query("SELECT * FROM matches ORDER BY date");
        $matches = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'matches' => $matches]);
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Action non reconnue']);
        break;
}