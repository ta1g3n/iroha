VERSION=test

docker:
	docker build . -t iroha:$(VERSION)

run:
	docker run -itd -v $(pwd)/server:/var/www/server -v $(pwd)/client:/var/www/client -p 9000:80 --name iroha iroha:test
