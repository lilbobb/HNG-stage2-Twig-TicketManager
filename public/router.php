<?php

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

$basePath = dirname($_SERVER['SCRIPT_NAME']);
if ($basePath !== '/' && $basePath !== '\\') {
    $path = substr($path, strlen($basePath));
}

$path = rtrim($path, '/') ?: '/';

$isStaticFile = preg_match('/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i', $path);

if ($isStaticFile && file_exists(__DIR__ . $path)) {
    $extension = pathinfo($path, PATHINFO_EXTENSION);
    $contentTypes = [
        'js' => 'application/javascript',
        'css' => 'text/css',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif' => 'image/gif',
        'ico' => 'image/x-icon',
        'svg' => 'image/svg+xml',
        'woff' => 'font/woff',
        'woff2' => 'font/woff2',
        'ttf' => 'font/ttf',
        'eot' => 'application/vnd.ms-fontobject'
    ];
    
    $contentType = $contentTypes[$extension] ?? 'text/plain';
    header('Content-Type: ' . $contentType);
    
    readfile(__DIR__ . $path);
    return true;
}

$appRoutes = ['/', '/login', '/signup', '/dashboard', '/tickets'];

if (in_array($path, $appRoutes) || !file_exists(__DIR__ . $path)) {
    $_SERVER['ORIGINAL_PATH'] = $path;
    include __DIR__ . '/index.php';
} else {
    return false;
}