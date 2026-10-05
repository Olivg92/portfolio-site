# Transcripts

What each command of the guided tour printed, as it printed it.

- The local ones were captured on 2026-10-04 from platform-eks-gitops at commit 906cee9, on a
  laptop, with the local k3d platform; `git clone` with its English messages.
- The AWS ones were captured on 2026-10-05 from a fresh clone of the same commit, in one session:
  `make aws-setup`, `make plan`, `make up`, `make aws-verify`, then `make down`.

Durations are those of these runs. Only a few kinds of edit are allowed, all visible:

- the AWS account ID and the machine's public address are masked, as `<account id>` and
  `<your IP>`;
- an answer typed at a prompt (`perso`, `yes`) is shown after it, as on the screen, since a pipe
  does not echo it;
- the line where `make` reports that a port-forward such as `make argocd-ui` was stopped is left
  out, as it says nothing about the command;
- a line that starts with `# ` is a note for the reader, not output: `make plan` keeps only its
  summary after the detail of the 28 resources.
