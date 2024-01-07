# Git Rules

## Commit Messages

1. Use the present tense ("Add feature" not "Added feature").
2. Use the imperative mood ("Move cursor to..." not "Moves cursor to...").
3. Limit the first line to 72 characters or less.
4. Reference issues and pull requests liberally after the first line.
5. Consider starting the commit message with an applicable emoji:
    * :art: `:art:` when improving the format/structure of the code.
    * :racehorse: `:racehorse:` when improving performance.
    * :non-potable_water: `:non-potable_water:` when plugging memory leaks.
    * :memo: `:memo:` when writing docs.
    * :fix: `:fix:` when fixing bugs.
    * :feat: `:feat:` when adding a new feature

## Branches

1. Always create a new branch for your work.
2. Name the branch according to the work you're doing (e.g., `feature/new-feature`, `bugfix/issue-number`).
3. Never work directly on the `main` branch.
4. Delete the branch after its been merged.

## Pull Requests

1. Fill in the proposed pull request template.
2. Have your pull request reviewed by at least one other developer before merging.
3. Merge your pull request using the "Squash and Merge" strategy.

## Code Reviews

1. Always leave constructive feedback.
2. Never take feedback personally.
3. Always review your own code first.

Remember, the goal of these rules is to make our codebase manageable and our work with Git more productive.

# Git Rules Examples

## Commit Messages

1. Good: "Add login feature"
    Bad: "Added login feature"
2. Good: "Change color scheme to improve accessibility"
    Bad: "Changes color scheme to improve accessibility"
3. Good: "Fix bug causing app crash"
    Bad: "Fixed the bug that was causing the app to crash when the user clicked on the 'Submit' button"
4. Good: "Fix bug causing app crash (See issue #123)"
5. Good: ":art: Refactor login code for readability"

## Branches

1. Good: `git checkout -b feature/login`
2. Good: `git checkout -b bugfix/123`
3. Bad: Making changes and committing them directly on `main`
4. Good: `git branch -d feature/login` after it has been merged into `main`

## Pull Requests

1. Good: Filling in the PR template with details about what changes you made, why you made them, and what issue your PR is resolving.
2. Good: Requesting a code review from a teammate before merging your PR.
3. Good: Using the "Squash and Merge" option when merging your PR to keep the commit history clean.

## Code Reviews

1. Good: "I noticed you used a for loop here, but a while loop might be more efficient in this case."
2. Bad: Taking the previous feedback as a personal attack.
3. Good: Looking over your changes and catching a bug before even requesting a code review.

Remember, the goal of these rules is to make our codebase manageable and our work with Git more productive.