# Batch Dispatch Plan — <date>

Status: DRAFT | APPROVED | EXECUTING | COMPLETED
Analyst: Claude Code
Executor: Codex CLI

---

## 1. Input: PENDING Task Pool

| Task ID | Title | Mode | Batch-eligible | Touched Files | Est. Duration |
|---------|-------|------|----------------|---------------|---------------|
| task_XXX | ... | MANUAL/DELEGATED | YES/NO | file list | ~Xmin |

---

## 2. File Conflict Matrix

```
          | t_XXX | t_YYY | t_ZZZ |
file_a.ts |   W   |       |   R   |  <- no conflict (W + R)
file_b.ts |   W   |   W   |       |  <- conflict! sequential order required
```

Legend: `W` = write, `R` = read-only, blank = untouched.

---

## 3. Dependency DAG

Use plain text graph or mermaid:

```
task_XXX --> task_ZZZ
task_YYY --> (independent)
```

---

## 4. Wave Plan

### Wave 1 (parallel)
- Slots: N executor + M reviewer
- Tasks: [task_XXX, task_YYY]
- File locks: `file_a` -> task_XXX, `file_c` -> task_YYY

### Wave 2 (after Wave 1)
- Slots: ...
- Tasks: [task_ZZZ]
- Unblocked by: task_XXX (`file_a` released)

---

## 5. Execution Mode Summary

- Total tasks: N
- MANUAL tasks: X
- DELEGATED tasks: Y
- Batch waves: Z
- Estimated total slot-hours: ...
- Slot allocation mode: FIXED | DYNAMIC

---

## 6. Risk Notes

- (file conflicts, sequencing constraints, expected bottlenecks)

---

## 7. Approval

- [ ] User approved batch plan
- [ ] Codex acknowledged execution order
