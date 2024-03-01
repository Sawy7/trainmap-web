FROM node:21-bookworm

# Install PHP and pgsql (all depends on composer package manager)
RUN apt-get update && apt-get install -y composer php-pdo-pgsql

# Enable PHP extensions
RUN sed -i 's/;extension=pdo_pgsql/extension=pdo_pgsql/' /etc/php/8.2/cli/php.ini

WORKDIR /mapster
