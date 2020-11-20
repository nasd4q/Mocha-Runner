import { parse } from 'jest-editor-support';
import * as path from 'path';
import { findFullTestName } from '../../util';

const children = parse(path.resolve(__dirname, 'test2.test.js')).root.children;

it('should find line 1', () => {
  expect(findFullTestName(1, children)).toBe('testSuiteA');
});

it('should find line 2', () => {
  expect(findFullTestName(2, children)).toBe('testSuiteA test1()');
});

it('should find line 4', () => {
  expect(findFullTestName(4, children)).toBe('testSuiteA test1() should run this test');
});

it('should find line 13', () => {
  expect(findFullTestName(13, children)).toBe('testSuiteA test2 should run this test');
});

it('should find line 23', () => {
  expect(findFullTestName(23, children)).toBe('testSuiteB lol');
  expect(findFullTestName(24, children)).toBe('testSuiteB lol');
});

it('should find line 17', () => {
  expect(findFullTestName(17, children)).toBe('testSuiteA test2 test3 should run this test 3');
});
