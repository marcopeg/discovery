#
# Simple interface to run Docker!
#


# Running container's name
organization?=marcopeg
name:=$(shell node -p "require('./package.json').name")
version:=$(shell node -p "require('./package.json').version")

# Docker image tag name
tag?=${organization}/${name}
port?=3000

# Build the project using cache
image:
	npm install
	npm run build
	docker build -t ${tag} -t ${tag}:${version} .
	
# Spins up a container from the latest available image
# this is useful to test locally
run:
	docker run \
		--rm \
		--name ${name} \
		-p ${port}:80 \
		${tag}

stop:
	docker stop ${name}

remove:
	docker rm ${name}

# Like start, but in background
# classic way to launch it on a server
boot:
	docker run \
		-d \
		--name ${name} \
		-p ${port}:80 \
		${name}

down: stop remove

# Gain access to a running container
ssh:
	docker exec \
		-it \
		${name} \
		/bin/sh

publish:
	docker tag ${tag}:${version} ${tag}:${version}
	docker tag ${tag}:${version} ${tag}:latest
	docker push ${tag}:${version}
	docker push ${tag}:latest

release: image publish
