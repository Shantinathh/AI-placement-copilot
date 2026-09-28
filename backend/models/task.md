# Model Improvement Tasks

- [x] Research - analyzed dataset, ran benchmarks across 5 algorithms
- [x] Benchmark confirmed: RF is best classifier (~55.7%), HistGradBoost best for regressor
- [x] Rewrite train_models.py with:
  - [ ] Feature engineering (15 new composite features)
  - [ ] StandardScaler on numerics
  - [ ] CalibratedClassifierCV on RF classifier (better probability outputs)
  - [ ] Optimal threshold via ROC curve
  - [ ] ROC-AUC metric tracking
  - [ ] Switch regressor to HistGradientBoostingRegressor
  - [ ] Tune regressor hyperparameters
  - [ ] Save all train + test metrics to model_accuracy.json
- [ ] Retrain models (python -m backend.ml.train_models)
- [ ] Verify model_accuracy.json updated with real metrics
- [ ] Fix SyntaxError in ai_roadmap.py (backend won't start)
