# Batch Test Generator Guide

## Overview

The Batch Test Generator extends the AI Test Generator to analyze and generate tests for multiple files at once, with progress tracking and bulk download capabilities.

## Features

✨ **Multi-File Selection**: Choose multiple files from an interactive file tree
📊 **Progress Tracking**: Real-time progress as tests are generated
📦 **Bulk Download**: Download all generated tests as a ZIP file
🎯 **Organized Output**: Maintains your project structure in the ZIP
⚡ **Parallel Processing**: Efficient generation for large codebases
📈 **Success Reporting**: See which files succeeded or failed

## How to Use

### Step 1: Access Batch Generator

1. Navigate to **Admin Dashboard** → **Testing** tab
2. Click on **Batch Generator** tab
3. You'll see a file tree selector on the left

### Step 2: Select Files

**File Tree Navigation:**
- Folders are displayed with 📁 icon
- Files are displayed with 📄 icon and checkboxes
- Click checkboxes to select files for test generation

**Quick Selection Tips:**
- Select all components in a directory
- Choose specific services to test
- Mix and match different file types

**Example Selection:**
```
✅ src/components/inventory/AddItemModal.tsx
✅ src/components/inventory/EditItemModal.tsx
✅ src/services/inventory.service.ts
✅ src/hooks/useInventoryFilters.ts
```

### Step 3: Generate Tests

1. Review your selection (badge shows count)
2. Click **"Generate Tests"** button
3. Watch the progress bar and current file indicator
4. Wait for all files to complete

**Progress Display:**
```
Generating tests for: src/components/AddItemModal.tsx
Progress: ████████░░ 80%
```

### Step 4: Review Results

After generation completes, you'll see:
- ✅ Green checkmark: Test generated successfully
- ❌ Red X: Generation failed (with error message)
- File path for each result

**Example Results:**
```
✅ src/components/inventory/AddItemModal.tsx
✅ src/components/inventory/EditItemModal.tsx
❌ src/services/inventory.service.ts (Generation failed)
✅ src/hooks/useInventoryFilters.ts
```

### Step 5: Download Tests

Click **"Download All Tests as ZIP"** to get:
- All successfully generated test files
- Proper directory structure maintained
- Ready to extract into your project

**ZIP Contents:**
```
test-suite-1234567890.zip
├── src/
│   ├── components/
│   │   └── inventory/
│   │       ├── AddItemModal.test.tsx
│   │       └── EditItemModal.test.tsx
│   ├── services/
│   │   └── inventory.service.test.ts
│   └── hooks/
│       └── useInventoryFilters.test.ts
```

## Use Cases

### Use Case 1: New Feature Testing
Generate tests for all components in a new feature:
1. Select all files in feature directory
2. Generate tests in batch
3. Download and extract to project
4. Run tests to verify coverage

### Use Case 2: Legacy Code Coverage
Add tests to existing codebase:
1. Select untested files from Coverage Dashboard
2. Batch generate tests
3. Review and adjust generated tests
4. Improve overall coverage

### Use Case 3: Refactoring Safety Net
Before major refactoring:
1. Generate tests for all affected files
2. Run tests to establish baseline
3. Refactor code
4. Tests ensure behavior unchanged

### Use Case 4: CI/CD Integration
Automate test generation:
1. Select all modified files
2. Generate tests in batch
3. Add to pull request
4. Ensure new code has tests

## Best Practices

### 1. Start Small
Begin with 3-5 files to verify output quality before batch processing large numbers.

### 2. Group by Type
Generate tests for similar file types together:
- All components in one batch
- All services in another
- Hooks separately

### 3. Review Before Committing
Always review generated tests before committing:
- Verify mocks are correct
- Check test data is realistic
- Ensure edge cases are covered

### 4. Handle Failures
If some files fail:
- Check error messages
- Try generating individually
- Verify file syntax is correct
- Ensure dependencies are available

### 5. Maintain Structure
Keep the same directory structure:
- Tests next to source files
- Or in `__tests__` directories
- Follow your project conventions

## Advanced Features

### Selective Re-generation

If some tests fail or need updates:
1. Deselect successful files
2. Keep failed files selected
3. Regenerate only those files

### Progress Monitoring

Track generation progress:
- **Progress Bar**: Overall completion percentage
- **Current File**: Which file is being processed
- **Results List**: Success/failure for each file

### Error Handling

The generator handles various errors:
- **File Not Found**: Skips missing files
- **Parse Errors**: Reports syntax issues
- **API Failures**: Retries or reports failure
- **Timeout**: Moves to next file after delay

## Integration with Other Tools

### Coverage Dashboard Integration

1. Generate tests with Batch Generator
2. Extract ZIP to project
3. Run `npm run test:coverage`
4. View results in Coverage Dashboard
5. Identify remaining gaps

### AI Test Generator Integration

For files that need custom attention:
1. Use Batch Generator for bulk
2. Use AI Generator for complex files
3. Combine both approaches

### CI/CD Pipeline

```yaml
# Example GitHub Action
- name: Generate Tests
  run: |
    npm run test:generate-batch
    npm run test
    npm run test:coverage
```

## Performance Tips

### Optimize Generation Speed

1. **Select Strategically**: Don't generate tests for files that already have good coverage
2. **Batch Size**: Process 10-20 files at a time for optimal speed
3. **Network**: Ensure stable connection for API calls
4. **Concurrent Limits**: Generator respects rate limits

### Resource Management

- Generation runs sequentially to avoid overwhelming the API
- Progress saved incrementally
- Can resume if interrupted

## Troubleshooting

### Issue: Generation is slow
**Solution**: 
- Reduce batch size
- Check network connection
- Verify API key is valid

### Issue: Some tests fail to generate
**Solution**:
- Check file syntax
- Verify file exists
- Try individual generation
- Review error messages

### Issue: ZIP download fails
**Solution**:
- Check browser permissions
- Ensure sufficient disk space
- Try smaller batch size

### Issue: Generated tests don't work
**Solution**:
- Review mocks and imports
- Check test data validity
- Verify dependencies installed
- Run tests individually first

## File Type Support

### Supported File Types

✅ **Components** (`.tsx`, `.jsx`)
- React components
- Functional components
- Class components
- HOCs

✅ **Services** (`.ts`, `.js`)
- API services
- Business logic
- Data transformations
- Utilities

✅ **Hooks** (`.ts`, `.tsx`)
- Custom React hooks
- State management
- Side effects
- Context consumers

✅ **Utilities** (`.ts`, `.js`)
- Helper functions
- Validators
- Formatters
- Parsers

## Example Workflows

### Workflow 1: Complete Feature Testing

```
1. Select all feature files:
   - Components (5 files)
   - Services (2 files)
   - Hooks (3 files)
   
2. Generate tests (10 files total)

3. Download ZIP

4. Extract to project:
   unzip test-suite-*.zip -d ./

5. Run tests:
   npm run test

6. Check coverage:
   npm run test:coverage
```

### Workflow 2: Incremental Coverage

```
1. Check Coverage Dashboard
2. Identify untested files
3. Select those files in Batch Generator
4. Generate missing tests
5. Review and adjust
6. Commit to repository
```

### Workflow 3: Pre-Release Testing

```
1. Select all modified files from last sprint
2. Batch generate tests
3. Run full test suite
4. Fix any failures
5. Deploy with confidence
```

## Tips for Success

1. **Consistent Naming**: Use clear, descriptive file names
2. **Clean Code**: Well-structured code generates better tests
3. **Type Safety**: TypeScript improves test quality
4. **Documentation**: JSDoc comments help AI understand intent
5. **Modularity**: Smaller files generate more focused tests

## Future Enhancements

Coming soon:
- Directory-level selection (select entire folders)
- Custom test templates per file type
- Parallel generation for faster processing
- Test quality scoring
- Automatic retry for failed generations
- Integration with version control
- Scheduled batch generation
- Test maintenance suggestions

## Support Resources

- AI Test Generator Guide
- Unit Testing Guide
- Coverage Dashboard Guide
- React Testing Library docs
- Vitest documentation
