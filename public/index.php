<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

define('BASE_PATH', dirname(__DIR__));
define('TEMPLATES_PATH', BASE_PATH . '/templates');
define('PUBLIC_PATH', __DIR__);

session_start();

try {
    require_once BASE_PATH . '/vendor/autoload.php';
    
    $loader = new \Twig\Loader\FilesystemLoader(TEMPLATES_PATH);
    $twig = new \Twig\Environment($loader, [
        'debug' => true,
    ]);
    
    $config = [
        'app_name' => 'FLix',
        'max_width' => '1440px'
    ];

    $requestUri = $_SERVER['REQUEST_URI'] ?? '/';
    $path = parse_url($requestUri, PHP_URL_PATH);
    
    $path = str_replace('/public', '', $path);
    
    $path = rtrim($path, '/');
    if (empty($path)) {
        $path = '/';
    }

    $isAuthenticated = isset($_SESSION['user']);
    $user = $_SESSION['user'] ?? null;

    switch ($path) {
        case '/':
            echo $twig->render('pages/landing.twig', [
                'user' => $user,
                'max_width' => $config['max_width'],
                'app_name' => $config['app_name']
            ]);
            break;
            
        case '/tickets':
            if (!$isAuthenticated) {
                header('Location: /login');
                exit;
            }
            echo $twig->render('pages/tickets.twig', [
                'user' => $user,
                'max_width' => $config['max_width'],
                'app_name' => $config['app_name']
            ]);
            break;
            
        case '/dashboard':
            if (!$isAuthenticated) {
                header('Location: /login');
                exit;
            }
            echo $twig->render('pages/dashboard.twig', [
                'user' => $user,
                'max_width' => $config['max_width'],
                'app_name' => $config['app_name']
            ]);
            break;
            
        case '/login':
            if ($isAuthenticated) {
                header('Location: /dashboard');
                exit;
            }
            echo $twig->render('pages/login.twig', [
                'user' => $user,
                'max_width' => $config['max_width'],
                'app_name' => $config['app_name']
            ]);
            break;
            
        case '/signup':
            if ($isAuthenticated) {
                header('Location: /dashboard');
                exit;
            }
            echo $twig->render('pages/signup.twig', [
                'user' => $user,
                'max_width' => $config['max_width'],
                'app_name' => $config['app_name']
            ]);
            break;
            
        case '/logout':
            session_destroy();
            header('Location: /');
            exit;
            break;
            
        case '/auth/login':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $email = $_POST['email'] ?? '';
                $password = $_POST['password'] ?? '';
                
                if ($email && $password) {
                    $_SESSION['user'] = [
                        'id' => 1,
                        'name' => 'User',
                        'email' => $email
                    ];
                    header('Location: /dashboard');
                    exit;
                } else {
                    header('Location: /login?error=Invalid credentials');
                    exit;
                }
            }
            break;
            
        case '/auth/signup':
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $email = $_POST['email'] ?? '';
                $password = $_POST['password'] ?? '';
                $confirmPassword = $_POST['confirmPassword'] ?? '';
                
                if ($email && $password && $password === $confirmPassword) {
                    $_SESSION['user'] = [
                        'id' => 1,
                        'name' => 'User',
                        'email' => $email
                    ];
                    header('Location: /dashboard');
                    exit;
                } else {
                    header('Location: /signup?error=Invalid input');
                    exit;
                }
            }
            break;
            
        default:
            // Check if it's a static file
            if (preg_match('/\.(js|css|png|jpg|jpeg|gif|ico)$/i', $path)) {
                $staticFile = PUBLIC_PATH . $path;
                if (file_exists($staticFile)) {
                    $mimeTypes = [
                        'js' => 'application/javascript',
                        'css' => 'text/css',
                        'png' => 'image/png',
                        'jpg' => 'image/jpeg',
                        'jpeg' => 'image/jpeg',
                        'gif' => 'image/gif',
                        'ico' => 'image/x-icon'
                    ];
                    
                    $extension = pathinfo($path, PATHINFO_EXTENSION);
                    if (isset($mimeTypes[$extension])) {
                        header('Content-Type: ' . $mimeTypes[$extension]);
                        readfile($staticFile);
                        exit;
                    }
                }
            }
            
            http_response_code(404);
            echo "Page not found: " . htmlspecialchars($path);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo "Error: " . $e->getMessage();
}