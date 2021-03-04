module.exports = {
    productionSourceMap: false,
    publicPath: '',
    devServer: {
        proxy: {
            '/spring/hook': {
                target: 'http://localhost:8888/'
            }
        }
    }
}