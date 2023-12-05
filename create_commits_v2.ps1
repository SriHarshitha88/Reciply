# Function to create a commit with a specific date
function Create-Commit {
    param(
        [string]$message,
        [string]$date
    )
    
    # Set the date for the commit
    $env:GIT_COMMITTER_DATE = $date
    $env:GIT_AUTHOR_DATE = $date
    
    # Create a dummy file to commit
    $filename = "dummy_$([System.Guid]::NewGuid().ToString().Substring(0,8)).txt"
    New-Item -Path $filename -ItemType File -Force
    git add $filename
    git commit -m $message
    
    # Clean up
    Remove-Item $filename
}

# Project initialization phase
Create-Commit -message "feat: initialize project structure" -date "2023-10-01T10:00:00"
Create-Commit -message "docs: add initial README with project description" -date "2023-10-02T14:30:00"
Create-Commit -message "chore: set up development environment and dependencies" -date "2023-10-03T11:15:00"

# Backend development phase
Create-Commit -message "feat: implement basic FastAPI backend structure" -date "2023-10-05T09:45:00"
Create-Commit -message "feat: add receipt scanning endpoint" -date "2023-10-07T16:20:00"
Create-Commit -message "feat: implement OCR service with Tesseract integration" -date "2023-10-10T13:10:00"
Create-Commit -message "test: add unit tests for receipt scanning" -date "2023-10-12T15:30:00"
Create-Commit -message "fix: resolve OCR accuracy issues" -date "2023-10-15T11:45:00"

# Mobile app development phase
Create-Commit -message "feat: create React Native project structure" -date "2023-10-18T10:00:00"
Create-Commit -message "feat: implement camera integration for receipt scanning" -date "2023-10-20T14:20:00"
Create-Commit -message "feat: add receipt processing UI components" -date "2023-10-22T16:30:00"
Create-Commit -message "style: implement app theme and styling" -date "2023-10-25T11:15:00"

# ML model development phase
Create-Commit -message "feat: implement custom CNN for receipt OCR" -date "2023-10-28T13:45:00"
Create-Commit -message "feat: add transformer model for expense categorization" -date "2023-11-01T15:20:00"
Create-Commit -message "perf: optimize ML models for mobile deployment" -date "2023-11-05T10:30:00"

# Integration and testing phase
Create-Commit -message "feat: integrate ML models with backend API" -date "2023-11-08T14:15:00"
Create-Commit -message "test: add integration tests for ML services" -date "2023-11-12T11:30:00"
Create-Commit -message "fix: resolve model inference performance issues" -date "2023-11-15T16:45:00"

# Documentation and deployment phase
Create-Commit -message "docs: add API documentation" -date "2023-11-18T10:20:00"
Create-Commit -message "docs: create architecture diagrams" -date "2023-11-20T14:30:00"
Create-Commit -message "chore: set up CI/CD pipeline" -date "2023-11-22T15:15:00"
Create-Commit -message "docs: update README with installation instructions" -date "2023-11-25T11:45:00"

# Final improvements
Create-Commit -message "perf: optimize image processing pipeline" -date "2023-11-28T13:20:00"
Create-Commit -message "feat: add dark mode support" -date "2023-12-01T16:30:00"
Create-Commit -message "docs: enhance project documentation" -date "2023-12-05T10:15:00" 