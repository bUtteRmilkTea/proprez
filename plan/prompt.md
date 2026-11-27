Work through plan/plan.md

Base branch: development (the current branch). Branch each phase from development. Only if a phase needs an earlier phase that is not merged yet, branch it from that phase's branch and say so in the PR.


For each phase:
0. make a new branch with the format feat/[phase name], no letter
1. make all the things needed for the phase
2. after everything needed for the phase commit it with format "[feat]: [branch name]" -m "[phase number] [what you do]"
4. push the new branch and make a pr targeting development
4. Then move on to the next phase. and repeat the steps

Stop and ask me if:
- tests keep failing after a few honest attempts
- you need a secret, API key, or a decision only I can make
- a migration would change more rows than the plan expects (print the count first)
- a "verify" item in the plan shows the plan's assumption is wrong

Never commit .env or secrets. Don't skip phases or rewrite the plan silently (if the plan must change, add a dated note in the plan and tell me).
dont include you as the collaborator and dont include generated with claude code in every commit and pr message as the settings said in .claude/settings.json