module.exports = {
    devServer: {
        proxy: {
            '/spring/hook': {
                target: 'http://localhost:8899'
            }
        }
    }
}