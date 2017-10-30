#!/usr/bin/env bash

cd "$(dirname "$0")/../"

export PATH="$HOME/.composer/vendor/bin:$PATH"
bash bin/install-wp-tests.sh wordpress_test root '' localhost $WP_VERSION
source bin/install-php-phpunit.sh
# Run the build because otherwise there will be a bunch of warnings about
# failed `stat` calls from `filemtime()`.
npm install || exit 1
npm run build || exit 1
# Make sure phpegjs parser is up to date
node bin/create-php-parser.js || exit 1
if ! git diff --quiet --exit-code lib/parser.php; then
	echo 'ERROR: The PEG parser has been updated, but the generated PHP version'
	echo '       (lib/parser.php) has not.  Run `bin/create-php-parser.js` and'
	echo '       commit the resulting changes to resolve this.'
	sleep .2 # Otherwise Travis doesn't want to print the whole message
	exit 1
fi
echo Running with the following versions:
php -v
phpunit --version
# Check parser syntax
php lib/parser.php || exit 1
# Run PHPUnit tests
phpunit || exit 1
WP_MULTISITE=1 phpunit || exit 1
