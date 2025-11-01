# Quality Gate System Guide

## Overview

The Quality Gate System is an automated CI/CD integration that enforces minimum test quality standards before allowing code merges. It provides configurable thresholds, automatic PR comments, quality trend tracking, and team dashboards.

## Features

### 1. Quality Gate Configuration
- **Configurable Thresholds**: Set minimum scores for each quality metric
- **Per-Metric Control**: Individual thresholds for coverage, edge cases, mocks, assertions, and best practices
- **Enable/Disable**: Toggle quality gate enforcement on/off
- **Persistent Settings**: Configuration saved to database per user

### 2. Team Quality Dashboard
- **Average Quality Score**: Overall team performance metric
- **Quality Trends**: Track improvements or regressions over time
- **Total Tests Analyzed**: Count of all tests with quality scores
- **Passing Rate**: Percentage of tests meeting quality standards
- **Recent Scores**: View latest test quality results
- **Quality Breakdown**: Visual breakdown by metric

### 3. CI/CD Integration
- **GitHub Actions Workflow**: Automatic quality checks on PRs
- **PR Comments**: Detailed quality reports posted to pull requests
- **Quality Gate Enforcement**: Block merges if quality standards not met
- **Changed Files Detection**: Only analyze modified test files

### 4. Quality Tracking
- **Historical Data**: Store all quality scores with timestamps
- **Trend Analysis**: Compare recent vs. older test quality
- **Per-File Tracking**: Monitor quality of individual test files
- **Commit Association**: Link scores to specific commits and PRs

## Configuration

### Setting Quality Thresholds

1. Navigate to Admin Testing Panel → Quality Gate tab
2. Adjust minimum scores for each metric:
   - **Minimum Overall Score**: Default 70
   - **Minimum Coverage Score**: Default 70
   - **Minimum Edge Case Score**: Default 60
   - **Minimum Mock Quality Score**: Default 65
   - **Minimum Assertion Score**: Default 75
   - **Minimum Best Practices Score**: Default 70
3. Toggle "Enabled" switch to activate/deactivate quality gate
4. Click "Save Configuration"

### GitHub Actions Setup

The quality gate workflow (`.github/workflows/quality-gate.yml`) automatically:
- Triggers on pull requests to main/develop branches
- Detects changed test files
- Analyzes test quality using AI
- Posts results as PR comment
- Fails the build if quality standards not met

## Quality Metrics

### 1. Coverage Completeness (0-100)
- Tests all major code paths
- Includes happy path and error scenarios
- Tests edge cases and boundary conditions
- Covers all public methods/functions

### 2. Edge Case Handling (0-100)
- Tests null/undefined inputs
- Tests empty arrays/objects
- Tests boundary values (min/max)
- Tests error conditions
- Tests race conditions (async code)

### 3. Mock Quality (0-100)
- Appropriate use of mocks vs. real implementations
- Mocks are properly configured
- Mock assertions verify behavior
- No over-mocking or under-mocking

### 4. Assertion Strength (0-100)
- Specific assertions (not just truthy checks)
- Multiple assertions per test when appropriate
- Assertions test the right things
- Clear assertion messages

### 5. Best Practices (0-100)
- Clear test descriptions
- Proper test organization (describe/it blocks)
- Setup/teardown when needed
- No test interdependencies
- Follows AAA pattern (Arrange, Act, Assert)

## Using the Quality Dashboard

### Viewing Team Metrics

1. Navigate to Admin Testing Panel → Quality Dashboard
2. View key metrics:
   - **Average Quality**: Overall team score with trend indicator
   - **Total Tests**: Count and passing percentage
   - **Quality Breakdown**: Visual progress bars for each metric
   - **Recent Scores**: List of latest test quality results

### Interpreting Trends

- **Green Arrow Up**: Quality improving over time
- **Red Arrow Down**: Quality declining, needs attention
- **Trend Value**: Shows point difference between recent and older tests

### Score Color Coding

- **Green (80-100)**: Excellent quality
- **Blue (70-79)**: Good quality
- **Yellow (60-69)**: Fair quality, needs improvement
- **Red (0-59)**: Poor quality, requires immediate attention

## CI/CD Workflow

### Automatic PR Checks

When you create a pull request:

1. GitHub Actions detects changed test files
2. Each test file is analyzed for quality
3. Quality scores are calculated for all metrics
4. Results are posted as PR comment
5. Build passes/fails based on thresholds

### PR Comment Format

```
## 🧪 Test Quality Gate Report

✅ All tests meet quality standards!

### Results:
✅ src/components/__tests__/MyComponent.test.tsx: Score 85 (Passed)
✅ src/services/__tests__/MyService.test.ts: Score 78 (Passed)

### Quality Thresholds:
- Minimum Overall Score: 70
- Minimum Coverage Score: 70
- Minimum Edge Case Score: 60
- Minimum Mock Quality: 65
- Minimum Assertion Strength: 75
- Minimum Best Practices: 70
```

## Database Schema

### test_quality_scores Table

Stores all quality analysis results:
- `id`: Unique identifier
- `user_id`: User who created the test
- `file_path`: Full path to test file
- `file_name`: Test file name
- `overall_score`: Overall quality score (0-100)
- `coverage_score`: Coverage metric (0-100)
- `edge_case_score`: Edge case metric (0-100)
- `mock_quality_score`: Mock quality metric (0-100)
- `assertion_score`: Assertion strength metric (0-100)
- `best_practices_score`: Best practices metric (0-100)
- `feedback`: JSON object with detailed feedback
- `commit_sha`: Git commit hash
- `branch_name`: Git branch name
- `pr_number`: Pull request number
- `created_at`: Timestamp

### quality_gate_config Table

Stores user quality gate configuration:
- `id`: Unique identifier
- `user_id`: User who owns the configuration
- `config_name`: Configuration name (default: 'default')
- `min_overall_score`: Minimum overall score threshold
- `min_coverage_score`: Minimum coverage threshold
- `min_edge_case_score`: Minimum edge case threshold
- `min_mock_quality_score`: Minimum mock quality threshold
- `min_assertion_score`: Minimum assertion threshold
- `min_best_practices_score`: Minimum best practices threshold
- `enabled`: Whether quality gate is active
- `created_at`: Timestamp
- `updated_at`: Last update timestamp

## Edge Function

### quality-gate-check

Analyzes test code and returns quality scores:

**Endpoint**: `/functions/v1/quality-gate-check`

**Request Body**:
```json
{
  "testCode": "test code string",
  "filePath": "src/components/__tests__/MyComponent.test.tsx",
  "fileName": "MyComponent.test.tsx",
  "commitSha": "abc123",
  "branchName": "feature/my-feature",
  "prNumber": 42,
  "userId": "user-uuid"
}
```

**Response**:
```json
{
  "filePath": "src/components/__tests__/MyComponent.test.tsx",
  "fileName": "MyComponent.test.tsx",
  "overallScore": 85,
  "coverageScore": 88,
  "edgeCaseScore": 82,
  "mockQualityScore": 85,
  "assertionScore": 90,
  "bestPracticesScore": 80,
  "feedback": {
    "strengths": ["Clear test descriptions", "Good coverage"],
    "improvements": ["Add more edge cases"],
    "recommendations": ["Consider testing error scenarios"]
  },
  "commitSha": "abc123",
  "branchName": "feature/my-feature",
  "prNumber": 42
}
```

## Best Practices

### Writing High-Quality Tests

1. **Test One Thing**: Each test should verify a single behavior
2. **Clear Names**: Use descriptive test names that explain what's being tested
3. **AAA Pattern**: Arrange (setup), Act (execute), Assert (verify)
4. **Edge Cases**: Always test boundary conditions and error scenarios
5. **Meaningful Assertions**: Use specific assertions with clear messages
6. **Minimal Mocking**: Only mock external dependencies, not internal logic
7. **Independent Tests**: Tests should not depend on each other
8. **Cleanup**: Use beforeEach/afterEach for setup and teardown

### Improving Quality Scores

If your tests don't meet quality standards:

1. **Review Feedback**: Check the detailed feedback from the analyzer
2. **Add Edge Cases**: Test null, undefined, empty values, boundaries
3. **Improve Coverage**: Ensure all code paths are tested
4. **Strengthen Assertions**: Use specific matchers (toEqual, toHaveLength, etc.)
5. **Follow Conventions**: Use describe/it blocks, clear names, AAA pattern
6. **Refactor Mocks**: Ensure mocks are appropriate and well-configured

## Troubleshooting

### Quality Gate Failing

**Issue**: PR blocked by quality gate

**Solutions**:
1. Review the PR comment for specific failing tests
2. Analyze each test using the Quality Analyzer tab
3. Follow recommendations to improve test quality
4. Re-run quality checks after improvements

### Configuration Not Saving

**Issue**: Quality gate configuration not persisting

**Solutions**:
1. Ensure you're logged in
2. Check browser console for errors
3. Verify database connection
4. Check RLS policies are correctly configured

### No Quality Data

**Issue**: Quality Dashboard shows no data

**Solutions**:
1. Analyze some tests using the Quality Analyzer
2. Run tests through CI/CD pipeline
3. Check that test_quality_scores table has data
4. Verify user authentication

## Future Enhancements

- **Custom Quality Rules**: Define project-specific quality criteria
- **Quality Badges**: Display quality scores in README
- **Slack Integration**: Post quality reports to Slack channels
- **Quality Goals**: Set team quality improvement targets
- **Historical Charts**: Visualize quality trends over time
- **Per-Project Config**: Different thresholds for different projects
- **Quality Leaderboard**: Gamify test quality improvements

## Support

For issues or questions:
1. Check this guide for common solutions
2. Review the TEST_QUALITY_SCORING_GUIDE.md
3. Check GitHub Actions logs for CI/CD issues
4. Review edge function logs in Supabase dashboard
