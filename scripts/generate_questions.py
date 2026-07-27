#!/usr/bin/env python3
"""ローカル用: プロンプトを標準出力し、貼り付けJSONを検証する補助スクリプト。"""

from __future__ import annotations

import argparse
import json
import sys


def build_prompt(keywords: str, reference: str, count: int) -> str:
    topic = keywords.strip() or "ITパスポート全般"
    lines = [
        "あなたはITパスポート試験の問題作成者です。",
        f"次のキーワードに沿った、オリジナルの四択問題を {count} 問作成してください。",
        f"キーワード: {topic}",
    ]
    if reference.strip():
        lines.append(f"参考文:\n{reference.strip()}")
    lines.extend(
        [
            "条件:",
            "- 著作権のある過去問の丸写しはしない",
            '- 各問題は body / choice_a / choice_b / choice_c / choice_d / correct を持つ',
            '- correct は "A" "B" "C" "D" のいずれか',
            "- 出力は JSON 配列のみ（説明文やコードフェンスは付けない）",
        ]
    )
    return "\n".join(lines)


def validate(path: str) -> None:
    text = sys.stdin.read() if path == "-" else open(path, encoding="utf-8").read()
    data = json.loads(text)
    if not isinstance(data, list) or not data:
        raise SystemExit("JSON 配列が空です")
    for i, item in enumerate(data, start=1):
        for key in ("body", "choice_a", "choice_b", "choice_c", "choice_d", "correct"):
            if not str(item.get(key, "")).strip():
                raise SystemExit(f"{i} 問目: {key} が不足")
        if str(item["correct"]).upper() not in {"A", "B", "C", "D"}:
            raise SystemExit(f"{i} 問目: correct が不正")
    print(f"OK: {len(data)} 問")


def main() -> None:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("prompt")
    p.add_argument("--keywords", default="")
    p.add_argument("--reference", default="")
    p.add_argument("--count", type=int, default=5)

    v = sub.add_parser("validate")
    v.add_argument("path", nargs="?", default="-")

    args = parser.parse_args()
    if args.cmd == "prompt":
        print(build_prompt(args.keywords, args.reference, args.count))
    else:
        validate(args.path)


if __name__ == "__main__":
    main()
