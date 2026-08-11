#!/usr/bin/env bash
# SPDX-License-Identifier: MPL-2.0
# Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>
#
# ovine-design.sh — drive one TRIAL-BACKLOG entry per fresh Claude thread.
#
# WHY THIS EXISTS
#
# docs/design/TRIAL-BACKLOG.adoc holds the owner's design intent verbatim. The
# work of turning an entry into logic, intent and interim steps is long, and a
# long thread is precisely where restatement drift accumulates: an agent
# re-states the idea plausibly while layering new meaning onto it, and every
# later turn builds on the restatement rather than the original.
#
# So the unit of work is ONE ENTRY, ONE THREAD, and this script is the handoff.
# The quote is carried into the working document and into the brief by `sed`
# from the source file — never retyped, never summarised, never "tidied". That
# is the whole point of the id comments in the backlog: the handoff is
# mechanical, so it cannot drift.
#
# It deliberately does NOT: rank entries, invent sequencing, or decide anything.
# Ids are identity, not priority.
#
# Usage:
#   ovine-design.sh list            what is worked up and what is not
#   ovine-design.sh next            the next entry with no working document
#   ovine-design.sh show <id>       print one entry's quote, verbatim
#   ovine-design.sh start <id>      create its working document
#   ovine-design.sh brief <id>      print the paste-ready brief for a new thread
#   ovine-design.sh check           verify every working doc still quotes the
#                                   backlog byte-for-byte (drift detector)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKLOG="$ROOT/docs/design/TRIAL-BACKLOG.adoc"
LOGICS="$ROOT/docs/design/logics"

[ -f "$BACKLOG" ] || { echo "missing $BACKLOG" >&2; exit 2; }

# ── parsing ──────────────────────────────────────────────────────────────────
# An entry is a `// id: ov-NN` comment followed by the `* "…"` line under it.
# Emits: id<TAB>theme<TAB>quote
entries() {
    awk '
        /^=== / { theme = substr($0, 5); next }
        /^\/\/ id: / { id = $3; next }
        id != "" && /^\* / {
            q = substr($0, 3)
            gsub(/^"/, "", q); gsub(/"$/, "", q)
            printf "%s\t%s\t%s\n", id, theme, q
            id = ""
        }
    ' "$BACKLOG"
}

quote_of() { entries | awk -F'\t' -v i="$1" '$1==i {print $3; found=1} END{exit !found}'; }
theme_of() { entries | awk -F'\t' -v i="$1" '$1==i {print $2}'; }
doc_of()   { echo "$LOGICS/$1.adoc"; }

require_id() {
    [ -n "${1:-}" ] || { echo "usage: $0 $2 <id>   (try: $0 list)" >&2; exit 2; }
    quote_of "$1" >/dev/null 2>&1 || { echo "no such entry: $1   (try: $0 list)" >&2; exit 2; }
}

# ── commands ─────────────────────────────────────────────────────────────────
cmd_list() {
    local n_done=0 n_total=0
    printf '%-7s %-6s %s\n' "ID" "STATE" "ENTRY"
    printf '%-7s %-6s %s\n' "--" "-----" "-----"
    while IFS=$'\t' read -r id theme q; do
        n_total=$((n_total + 1))
        local state="—"
        if [ -f "$(doc_of "$id")" ]; then state="done"; n_done=$((n_done + 1)); fi
        printf '%-7s %-6s %.72s\n' "$id" "$state" "$q"
    done < <(entries)
    echo
    echo "$n_done of $n_total have a working document. Ids are identity, not priority —"
    echo "pick whichever one you actually want to think about."
}

cmd_next() {
    while IFS=$'\t' read -r id theme q; do
        [ -f "$(doc_of "$id")" ] || { echo "$id"; return 0; }
    done < <(entries)
    echo "every entry has a working document" >&2
    return 1
}

cmd_show() { require_id "${1:-}" show; quote_of "$1"; }

cmd_start() {
    require_id "${1:-}" start
    local id="$1" doc; doc="$(doc_of "$id")"
    [ -f "$doc" ] && { echo "already exists: ${doc#"$ROOT"/}" >&2; return 1; }
    mkdir -p "$LOGICS"
    local q theme; q="$(quote_of "$id")"; theme="$(theme_of "$id")"
    cat > "$doc" <<EOF
= $id — working document
:sectnums:

// SPDX-License-Identifier: CC-BY-SA-4.0
// Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>
//
// Created by scripts/ovine-design.sh. The entry below is copied from
// docs/design/TRIAL-BACKLOG.adoc by machine. DO NOT EDIT IT — \`ovine-design.sh
// check\` compares it byte-for-byte against the backlog and fails if it drifts.

Theme: _${theme}_

== The entry

[quote]
____
$q
____

== Intent — what is this actually asking?

Not what it would look like. What question about cognition, affect or conation
does trialling this answer? If the answer is "none", say so — that is a result.

_unanswered_

== Logic — how would it work

The rule, stated so it could be implemented twice and agree. Name what is
observed, what is believed, what is chosen, and by whom.

_unanswered_

== Interim steps

The smallest thing that shows something. The mockup is disposable, so "fake it
in JS to see if the behaviour reads" is a legitimate first step and often the
right one. Steps, not a schedule.

. _unanswered_

== What would make us discard this

The owner's framing includes "potentially discard". An entry with no discard
condition has not been thought about yet.

_unanswered_

== Open questions for the owner

_none yet_

== Status

* [ ] Intent agreed
* [ ] Logic stated
* [ ] Interim steps identified
* [ ] Discard condition named
EOF
    echo "created ${doc#"$ROOT"/}"
    echo "next:    $0 brief $id"
}

cmd_brief() {
    require_id "${1:-}" brief
    local id="$1" q theme doc; q="$(quote_of "$id")"; theme="$(theme_of "$id")"
    doc="$(doc_of "$id")"
    cat <<EOF
────────────────────────────────────────────────────────────────────────────
Paste the block below into a FRESH Claude thread, in metadatastician/project-ovine.
One entry per thread — that is deliberate.
────────────────────────────────────────────────────────────────────────────

I want to work through one entry from this repo's design backlog with you.

Read these first, in this order:
  docs/design/TRIAL-BACKLOG.adoc      — why the repo exists, and the ground rules
  ${doc#"$ROOT"/}   — the working document for this entry

THE ENTRY ($id — theme: $theme), quoted from the backlog:

    "$q"

RULES, and the first one is not negotiable:

1. DO NOT PARAPHRASE THAT SENTENCE. Not in your summary, not in a heading, not
   in a "so what you mean is". Restating it plausibly while layering new meaning
   onto it is the specific failure this estate has recorded and guards against.
   Quote it, or ask me. Never improve it.

2. The Three.js code in index.html and src/*.js is a MOCKUP and is meant to be
   disposable. It exists so I can see how something might look and work out
   which behaviours are worth capturing, modelling, or potentially discarding.
   Do not harden it, do not add build tooling to it, do not treat the Three.js
   dependency as an architectural decision. A proper implementation in Rust / a
   proof language comes later and separately.

3. CAC in CACBrainComponent / CACSystem is Cognitive-Affective-Conative. The
   repo's major role is as a testing ground for the enaction-engine's cognitive,
   affective and conative AI.

4. Do not invent sequencing across entries, and do not tell me this entry is
   more or less important than another. Ids are identity, not priority.

5. "Discard this" is a legitimate conclusion and I want it offered when it is
   the honest one. Say what would make us drop it.

WHAT I WANT OUT OF IT — fill in the working document's sections:

  Intent            what question about cognition/affect/conation this answers
  Logic             the rule, stated precisely enough to implement twice and
                    have both agree — what is observed, what is believed, what
                    is chosen, and by whom
  Interim steps     smallest thing that shows something first; faking it in the
                    JS mockup is a legitimate and often correct first step
  Discard condition what would tell us this is not worth carrying
  Open questions    anything you need me to decide

Work in the file. When we are done, run \`bash scripts/ovine-design.sh check\`
to confirm the quote has not drifted, then commit.
────────────────────────────────────────────────────────────────────────────
EOF
}

# Drift detector. The reason the id comments exist: a working document must keep
# quoting the backlog byte-for-byte, so that editing the backlog cannot silently
# orphan the reasoning built on it, and editing a working doc cannot silently
# rewrite the owner's words.
cmd_check() {
    local fail=0 checked=0
    while IFS=$'\t' read -r id theme q; do
        local doc; doc="$(doc_of "$id")"
        [ -f "$doc" ] || continue
        checked=$((checked + 1))
        local in_doc
        in_doc="$(awk '/^____$/{n++; next} n==1' "$doc" | sed -e 's/[[:space:]]*$//' | grep -v '^$' || true)"
        if [ "$in_doc" != "$q" ]; then
            echo "DRIFT: $id" >&2
            echo "  backlog: $q" >&2
            echo "  doc    : $in_doc" >&2
            fail=1
        fi
    done < <(entries)
    if [ "$fail" -ne 0 ]; then
        echo "" >&2
        echo "A working document no longer quotes the backlog exactly. Either the" >&2
        echo "backlog changed (update the doc from it) or the doc was edited (restore" >&2
        echo "it). Do not reconcile them by rewording — pick one and copy it." >&2
        return 1
    fi
    echo "PASS: $checked working document(s) quote the backlog exactly"
}

case "${1:-list}" in
    list)  cmd_list ;;
    next)  cmd_next ;;
    show)  shift; cmd_show "${1:-}" ;;
    start) shift; cmd_start "${1:-}" ;;
    brief) shift; cmd_brief "${1:-}" ;;
    check) cmd_check ;;
    *)     sed -n '/^# Usage:/,/^$/p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//' >&2; exit 2 ;;
esac
