import React from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

export const MathDisplay = ({ formula, block = false }) => {
  if (block) {
    return <BlockMath math={formula} />;
  }
  return <InlineMath math={formula} />;
};