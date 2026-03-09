pipeline {
    agent any

    environment {
        APP_NAME = "tiximax-fe-old"
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {

        stage('Initialize') {
            steps {
                script {
                    def BR = env.BRANCH_NAME
                    echo "[Init] Detected branch: ${BR}"

                    def branchMap = [
                        "deploy": [
                            envName: "deploy",
                            credId : "tiximax-fe-old-deploy",
                        ],
                    ]

                    if (!branchMap.containsKey(BR)) {
                        error("Unsupported branch '${BR}'. Allowed: ${branchMap.keySet()}")
                    }

                    env.ENVIRONMENT_NAME = branchMap[BR].envName
                    env.ENV_CRED_ID      = branchMap[BR].credId
                    env.IMAGE_TAG        = "${env.APP_NAME}:${env.ENVIRONMENT_NAME}-${env.BUILD_NUMBER}"
                    env.APP_NAME_UNIQUE  = "${env.APP_NAME}-${env.ENVIRONMENT_NAME}"

                    echo "[Init] ENVIRONMENT_NAME = ${env.ENVIRONMENT_NAME}"
                    echo "[Init] IMAGE_TAG        = ${env.IMAGE_TAG}"
                    echo "[Init] ENV_CRED_ID      = ${env.ENV_CRED_ID}"
                    echo "[Init] APP_NAME_UNIQUE  = ${env.APP_NAME_UNIQUE}"
                }
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
                echo "[${env.ENVIRONMENT_NAME}] Code checked out."
            }
        }

        stage('Build') {
            steps {
                echo "[${env.ENVIRONMENT_NAME}] Building Docker image…"

                withCredentials([file(credentialsId: env.ENV_CRED_ID, variable: 'ENV_FILE')]) {
                    sh '''
                        set -e
                        echo "--- Generating .env.build with all VITE_ variables"

                        # Extract only VITE_ variables from credential file
                        grep '^VITE_' "$ENV_FILE" > .env.build || true

                        if [ ! -s .env.build ]; then
                          echo "# No VITE_ variables found" > .env.build
                        fi

                        echo "--- Content of .env.build:"
                        cat .env.build

                        echo "--- Building Docker image"
                        DOCKER_BUILDKIT=1 docker build --pull -t "${IMAGE_TAG}" .

                        echo "--- Cleaning up .env.build"
                        rm -f .env.build
                    '''
                }

                echo "[Build] Completed → ${env.IMAGE_TAG}"
            }
        }

        stage('Deploy') {
            steps {
                echo "[${env.ENVIRONMENT_NAME}] Deploying container…"

                sh '''
                    set -e

                    echo "--- Stopping old container if exists"
                    docker rm -f "${APP_NAME_UNIQUE}" 2>/dev/null || true

                    echo "--- Starting new container"
                    docker run -d \
                        --name "${APP_NAME_UNIQUE}" \
                        --restart unless-stopped \
                        --network npm-network \
                        "${IMAGE_TAG}"

                    echo "--- Deploy OK"
                '''

                echo "[Deploy] Container ${env.APP_NAME_UNIQUE} is running."
            }
        }

        stage('Cleanup') {
            steps {
                echo "[${env.ENVIRONMENT_NAME}] Cleaning old images…"

                sh '''
                    set -e
                    echo "--- Cleaning old images (keep latest)"
                    OLD_IMAGES=$(docker images --format "{{.Repository}}:{{.Tag}}" | grep "${APP_NAME}:" | grep -v "${IMAGE_TAG}" || true)

                    for IMG in $OLD_IMAGES; do
                        echo "Deleting: $IMG"
                        docker rmi -f "$IMG" || true
                    done

                    docker image prune -f || true
                '''

                echo "[Cleanup] Old images removed."
            }
        }
    }

    post {
        always {
            echo "Pipeline finished for branch ${env.BRANCH_NAME}"
        }
    }
}