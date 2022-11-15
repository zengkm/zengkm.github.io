

type Last<T extends any[]> = T extends [...infer X, infer A , infer L] ? A : never;

type arr1 = ["a", "b", "c"];
type arr2 = [3];
type arr3 = [3, 2, 1, 'd'];

type tail1 = Last<arr1>; // expected to be 'c'
type tail2 = Last<arr2>; // expected to be 1
type tail3 = Last<arr3>; // expected to be 1

type A = {
  a: string;
  b: string;
}
type B = {
  b: number;
  d: string;
}

type C = A & B;
const m:C = {
  a: '1',
  b: '1',
  d: '1'
}

type D = Omit<A, keyof B>