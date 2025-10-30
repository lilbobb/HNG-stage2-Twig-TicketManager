<?php
session_start(); 

$user = $_SESSION['user'] ?? null;

$requestPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if ($user && $requestPath === '/login') {
    header('Location: /dashboard');
    exit;
}


require_once __DIR__ . '/../vendor/autoload.php';

$loader = new \Twig\Loader\FilesystemLoader(__DIR__ . '/../templates');
$twig = new \Twig\Environment($loader, [
    'cache' => false,
    'debug' => true,
]);

if (isset($_SERVER['ORIGINAL_PATH'])) {
    $path = $_SERVER['ORIGINAL_PATH'];
} else {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $basePath = dirname($_SERVER['SCRIPT_NAME']);
    if ($basePath !== '/') {
        $path = substr($path, strlen($basePath));
    }
}

$path = rtrim($path, '/') ?: '/';

try {
    switch ($path) {
        case '/':
            echo $twig->render('pages/landing.twig', [
                'app_name' => 'FLix',
                'current_route' => 'home',
                'user' => $user,
            ]);
            break;
            
        case '/login':
            echo $twig->render('pages/login.twig', [
                'app_name' => 'FLix',
                'current_route' => 'login',
                'user' => $user,
            ]);
            break;
            
        case '/signup':
            echo $twig->render('pages/signup.twig', [
                'app_name' => 'FLix',
                'current_route' => 'signup',
                'user' => $user,
            ]);
            break;
            
        case '/dashboard':
            echo $twig->render('pages/dashboard.twig', [
                'app_name' => 'FLix',
                'current_route' => 'dashboard',
                'user' => $user,
            ]);
            break;
            
        case '/tickets':
            echo $twig->render('pages/tickets.twig', [
                'app_name' => 'FLix',
                'current_route' => 'tickets',
                'user' => $user,
            ]);
            break;
            
        default:
            http_response_code(404);
            echo $twig->render('pages/landing.twig', [
                'app_name' => 'FLix',
                'user' => $user,
                'error' => 'Page not found'
            ]);
            break;
    }
} catch (Exception $e) {
    error_log('Error: ' . $e->getMessage());
    http_response_code(500);
    echo 'An error occurred: ' . htmlspecialchars($e->getMessage());
}