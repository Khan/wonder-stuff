// @flow

// Marks all properties of an object optional.
//
// We use this instead of $Shape<T> because spreading $Shape<$Exact<T>> ends up
// spreading $Exact<T> instead, losing the optionality of keys.
// https://github.com/facebook/flow/issues/6906#issuecomment-453439922
declare type Partial<T> = $ReadOnly<$Rest<T, {...}>>;
