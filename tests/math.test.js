const { calculateTip, add } = require('../src/math');

test('Should calculate total with tip', () => {
    const total = calculateTip(10, 0.3)
    // if (total !== 13) {
    //     throw new Error('Total tip should be 13. Got ' + total)
    // }
    expect(total).toBe(13)

})

test('Should calculate total with defualt tip', () => {
    const total = calculateTip(10)
    expect(total).toBe(12.5)
})

// FOR ASYNC FUNCTION
test('Async test demo', (done) => {
    setTimeout(() => {
        expect(1).toBe(1)
        done()
    }, 2000)
})

// FOR PROMISES
test('Should add two numbers', (done) => {
    add(2, 3).then((sum) => {
        expect(sum).toBe(5)
        done()
    })
})

// OTHER METHODS FOR PROMISES
test('Should add 2 numbers async/await', async () => {
    const sum = await add(10,22)
    expect(sum).toBe(32)
})

