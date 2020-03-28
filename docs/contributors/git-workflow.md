# Git Workflow

A good workflow for new contributors to follow is listed below:
- Fork the Gutenberg repository.
- Clone the forked repository.
- Create a new branch.
- Make code changes.
- Commit the code changes within the newly created branch.
- Push the branch to the forked repository.
- Submit a Pull Request to the Gutenberg repository.

Ideally name your branches with prefixes and descriptions, like this: `[type]/[change]`. A good prefix would be:

- `add/` = add a new feature
- `try/` = experimental feature, "tentatively add"
- `update/` = update an existing feature

For example, `add/gallery-block` means you're working on adding a new gallery block.

You can pick among all the <a href="https://github.com/WordPress/gutenberg/issues">tickets</a>, or some of the ones labelled <a href="https://github.com/WordPress/gutenberg/labels/Good%20First%20Issue">Good First Issue</a>.

The workflow is documented in greater detail in the [repository management](/docs/contributors/repository-management.md) document.

## Keeping Your Branch Up To Date

When many different people are working on a project simultaneously, pull requests can go stale quickly. A "stale" pull request is one that is no longer up to date with the main line of development, and it needs to be updated before it can be merged into the project.

There are two ways to do this: merging and rebasing. In Gutenberg, the recommendation is to rebase. Rebasing means rewriting your changes as if they're happening on top of the main line of development. This ensures the commit history is always clean and linear. Rebasing can be performed as many times as needed while you're working on a pull request. **Do share your work early on** by opening a pull request and keeping your history rebase as you progress.

The main line of development is known as the `master` branch. If you have a pull-request branch that cannot be merged into `master` due to a conflict (this can happen for long-running pull requests), then in the course of rebasing you'll have to manually resolve any conflicts in your local copy. Learn more in [section _Perform a rebase_](https://github.com/edx/edx-platform/wiki/How-to-Rebase-a-Pull-Request#perform-a-rebase) of _How to Rebase a Pull Request_.

Once you have resolved any conflicts locally you can update the pull request with `git push --force-with-lease`. Using the `--force-with-lease` parameter is important to guarantee that you don't accidentally overwrite someone else's work.

To sum it up, you need to fetch any new changes in the repository, rebase your branch on top of `master`, and push the result back to the repository. These are the corresponding commands:

```sh
git fetch
git rebase master
git push --force-with-lease origin your-branch-name
```

## Keeping Your Fork Up To Date

Working on pull request starts with forking the Gutenberg repository, your separate working copy. Which can easily go out of sync as new pull requests are merged into the main repository. Here your working repository is a `fork` and the main Gutenberg repository is `upstream`. When working on new pull request you should always update your fork before you do `git checkout -b my-new-branch` to work on a feature or fix.

You will need to add an `upstream` remote in order to keep your fork updated.

```sh
git remote add upstream https://github.com/WordPress/gutenberg.git
git remote -v
origin	git@github.com:your-account/gutenberg.git (fetch)
origin	git@github.com:your-account/gutenberg.git (push)
upstream	https://github.com/WordPress/gutenberg.git (fetch)
upstream	https://github.com/WordPress/gutenberg.git (push)
```

To sync your fork, you first need to fetch the upstream changes and merge them into your local copy:

``` sh
git fetch upstream
git checkout master
git merge upstream/master
```

Once your local copy is updated, push your changes to update your fork on GitHub:

```
git push
```

The above commands will update your `master` branch from _upstream_. To update any other branch replace `master` with the respective branch name.


## References
- https://git-scm.com/book/en/v2
- https://help.github.com/categories/collaborating-with-issues-and-pull-requests/
