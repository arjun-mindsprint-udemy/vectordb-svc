pipeline {
    agent {
        label 'windows-arjun'
    }

    environment {
        DOCKERHUB_USERNAME = credentials('DOCKERHUB_USERNAME_ARJUN')
        DOCKERHUB_TOKEN = credentials('DOCKERHUB_TOKEN_ARJUN')
        COMMIT_ID = "${env.GIT_COMMIT.take(6)}"
        APP_NAME = 'vectordb-svc'
        APP_ENV = 'dev'
        ENABLE_TRIVY = 'false'
        ENABLE_SONARQUBE = 'false'
        SONAR_TOKEN = credentials('SONAR_TOKEN_ARJUN')
        BUILD_TIME = "${new Date().format('yyyy-MM-dd\'T\'HH:mm:ss')}"
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Set Commit ID') {
            steps {
                script {
                    env.COMMIT_ID = env.GIT_COMMIT.take(6)
                    echo "COMMIT_ID set to: ${env.COMMIT_ID}"
                }
            }
        }

        stage('SonarQube Scan') {
            when {
                expression {return env.ENABLE_SONARQUBE == 'true'}
            }
            steps {
                withSonarQubeEnv('SonarQube') {
                    script{
                    def sonarResult = bat(script: '"C:\\Users\\arjun.nair\\Downloads\\sonar-scanner-cli-7.1.0.4889-windows-x64\\sonar-scanner-7.1.0.4889-windows-x64\\bin\\sonar-scanner.bat" -Dsonar.projectKey=%APP_NAME% -Dsonar.sources=. -Dsonar.host.url=http://127.0.0.1:9001 -Dsonar.login=%SONAR_TOKEN%', returnStatus: true)
                    env.SONAR_GATE = (sonarResult == 0) ? 'PASS':'FAIL'
                    env.SONAR_LAST_RUN = new Date().format("yyyy-MM-dd'T'HH:mm:ss")
                    }
                }
            }
        }

        stage('Set Build Info') {
            steps {
                dir('src/backend') {
                    script {
                    writeFile file: '.env', text: """
                    APP_NAME = ${env.APP_NAME}
                    NODE_ENV = ${env.APP_ENV}
                    COMMIT_ID = ${env.COMMIT_ID}
                    BUILD_TIME= ${env.BUILD_TIME}
                    SONAR_GATE = ${env.SONAR_GATE}
                    SONAR_LAST_RUN = ${env.SONAR_LAST_RUN}
                    """
                    }
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                bat '''
                    echo %DOCKERHUB_TOKEN% | docker login --username %DOCKERHUB_USERNAME% --password-stdin
                '''
            }
        }

        stage('Trivy Filesystem Scan') {
            when {
                expression {return env.ENABLE_TRIVY  == 'true'}
            }
            steps {
                script {
                    bat '''
                        echo Running Trivy Filesystem Scan...
                        trivy fs .
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    def app_name = env.APP_NAME
                    bat """
                        docker build -t arjun150800/${app_name}:${env.COMMIT_ID} .
                    """
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    def app_name = env.APP_NAME
                    bat """
                        docker push arjun150800/${app_name}:${env.COMMIT_ID}
                    """
                }
            }
        }

        stage('Trivy Image Scan') {
            when {
                expression {return env.ENABLE_TRIVY  == 'true'}
            }
            steps {
                script {
                    def trivyStatus = bat(script: 'trivy image arjun150800/%APP_NAME%:%COMMIT_ID%', returnStatus: true)
                }
            }
        }
        
        stage('Deploy with Helm') {
            steps {
                script {
                    def commitId = env.COMMIT_ID
                    def app_name = env.APP_NAME
                    def app_env = env.APP_ENV
                    withCredentials([string(credentialsId: 'OPENAI_API_KEY_ARJUN', variable: 'OPENAI_API_KEY')]) {
                    bat """
                        wsl helm upgrade --install ${app_name} ./charts/${app_name} -n ${app_env} --create-namespace --set image.tag=${commitId} --set env.openaiApiKey=%OPENAI_API_KEY%
                    """
                }
            }
            }
        }
    }

    post {
        always {
            echo 'Jenkins Pipeline Complete'
        }
    }
}