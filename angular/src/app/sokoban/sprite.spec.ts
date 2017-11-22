import { Sprite } from './sprite';

describe('Sprite', () => {
  it('should create an instance', () => {
    expect(new Sprite('./assets/images/rakisuta1.png', 3, 4)).toBeTruthy();
  });
});
