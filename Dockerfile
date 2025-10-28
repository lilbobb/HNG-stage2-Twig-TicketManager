FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    unzip \
    git \
    zip \
 && rm -rf /var/lib/apt/lists/*

COPY composer.phar /usr/local/bin/composer
RUN chmod +x /usr/local/bin/composer

WORKDIR /app

COPY . /app

RUN composer install --no-dev --optimize-autoloader

EXPOSE 10000

CMD ["php", "-S", "0.0.0.0:10000", "-t", "public"]
