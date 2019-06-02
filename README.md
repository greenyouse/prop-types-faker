# prop-types-faker
Generate fake props that match the propTypes data contract of your React component.

```bash
npm install --save-dev prop-types-faker
```

This makes testing quite a bit easier since you don't need to write fixture data
by hand for your test suites. Here's an example of how it could be used on a
basic component.

Create a component to put under test:

```javascript
// functional react component
export default const Greetings = name => <span>{`hello ${name}!`}</span>

// make sure to set the propTypes
Greetings.propTypes = {
    name: propTypes.string
}
```

Then use `generateProps` to create valid data for the component under test:

```javascript
import { shallow } from 'enzyme';
import Greetings from './Greetings';

describe('Greetings', () => {
    let fakeProps;

    beforeEach(() => {
        fakeProps = generateProps(Greetings);
    });

    it('should display the name', () => {
        const expectedText = `hello ${fakeProps}!`;

        const actual = shallow(<Greetings {...fakeProps} />)

        expect(actual.html().innerText).toBe(expectedText)
    });
});
```

## Contributions
Feel free to open issues for bugs. I'm still shaking out some new ideas and it
will probably be a bit before this library is stable.

## Thanks
* [react-fake-props](https://github.com/typicode/react-fake-props) - similar idea but with non-random data
* [jsverify](https://github.com/typicode/react-fake-props) - very nice, quickcheck-style property based testing system for JS
* [parse-prop-types](https://github.com/diegohaz/parse-prop-types.git) - a magical prop-types reader
