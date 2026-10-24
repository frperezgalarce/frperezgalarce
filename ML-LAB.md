# Machine Learning lab

Open `machine-learning.html` using the same static hosting as the rest of the site. No build, backend, third-party scripts or new dependencies are required. The lab follows the site's Spanish/English preference and is linked from Home and the optimization playground.

## Experiment

Compare logistic regression, k-nearest neighbors, a decision tree and Gaussian Naive Bayes on two clusters, two moons, concentric circles or XOR. Change the observation count, Gaussian coordinate noise, seed and model parameters, then select **Train & compare**. Initial results render automatically. Changing settings leaves the current results visible and prompts the visitor to retrain.

All four classifiers train on the same stratified 70% training set and report accuracy on both training observations and the held-out 30%. Held-out points never enter training. Seeds reproduce both coordinates and split. Plot extents use all observations for display only. Filled markers indicate training data and hollow markers test data; circles and squares distinguish the true classes without relying on color. Background colors show the predicted class at a 0.5 threshold. Boundaries are sampled on an 80 × 80 grid, not exact analytical curves or confidence regions.

## Models

- **Logistic regression:** intercept plus two raw features; 900 full-batch gradient-descent steps with learning rate 0.3; mean cross-entropy plus L2 penalty `lambda / 2 * ||w||²`, excluding the intercept. Finite-step educational approximation, without a convergence guarantee.
- **kNN:** Euclidean distance, unweighted vote, odd `k` from 1 to 25. Stable input order resolves equal-distance neighbors. These examples keep features on comparable scales; no standardization is applied.
- **Decision tree:** binary, axis-aligned greedy CART-style splits minimizing weighted Gini impurity; maximum depth from 1 to 8; at least two training observations per leaf. A split must reduce impurity. No pruning.
- **Gaussian Naive Bayes:** class priors and per-class feature means/variances estimated on training data; conditionally independent Gaussian features; variance floor `1e-6`; log-space scoring.

Datasets are synthetic and balanced. Coordinate noise is additional Gaussian noise (the two-cluster example also has intrinsic spread). This is a teaching tool using a single split, not a benchmark or a general-purpose ML library. In particular, repeatedly choosing settings using the displayed test results makes that set a tuning set; it is no longer an untouched final evaluation.

## Verification

```sh
node tests/ml-engine.test.cjs
node tests/playground-engine.test.cjs
```

The ML checks cover reproducibility, class balance, disjoint splits, input immutability, finite predictions, known separable and nonlinear examples, depth limits, zero-variance stability, and kNN against an independent full-sort reference. Browser checks cover initial rendering, datasets and parameters, validation, language switching and responsive layout.
