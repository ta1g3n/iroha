module.exports = {
    pages: {
        top: {
            entry: "src/pages/main.js",
            template: "public/index.html",
            filename: "index.html"
        },
        login: {
            entry: "src/pages/login.js",
            template: "public/login.html",
            filename: "login.html"
        },
        signup: {
            entry: "src/pages/signup.js",
            template: "public/signup.html",
            filename: "signup.html"
        },
        about: {
            entry: "src/pages/about.js",
            template: "public/about.html",
            filename: "about.html"
        }
    },
    css: {
        loaderOptions: {
            sass: {
                prependData: `@import '@/assets/sass/variables.scss';`
            }
        }
    }
};
