module.exports = {
    presets: [
        require.resolve('@babel/preset-env'),
        require.resolve('@babel/preset-typescript'),
    ],
    plugins: [
        [require.resolve('@babel/plugin-proposal-class-properties'), { loose: true }],
        [require.resolve('@babel/plugin-proposal-private-methods'), { loose: true }],
        [require.resolve('@babel/plugin-proposal-private-property-in-object'), { loose: true }],
        require.resolve('@babel/plugin-proposal-numeric-separator'), 
    ],
}