#!/usr/bin/env bash

## This script re-formats each `package.json` in the `packages` directory and
## orders the top-level keys by a consistent order. It also forces a few values
## to be standardized (such as 'author' always being 'Khan Academy').

if ! command -v jq &> /dev/null
then
    echo "jq not be found in PATH (you can install using 'brew install jq')"
    exit
fi

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

pushd "$SCRIPT_DIR/.." > /dev/null 2>&1 || exit

# We loop over all packages and re-order them (and re-indent)
# writing to a temp file and then overwriting the original file to avoid
# truncation errors (especially in the face of failures in the processing
# pipeline).
for PKG_NAME in $(git ls-files "packages/*/package.json"); do
    dir=$(dirname $PKG_NAME)
    echo $dir

    if jq --exit-status 'select(.private == true)' $PKG_NAME ; then
        continue
    fi

    jq --indent 4 ". |
        {name: .name}
        + (if .description then {description: .description} else {} end)
        + (if .author and .author != \"\" then {author: .author} else {author: \"Khan Academy\"} end)
        + (if .keywords then {keywords: .keywords} else {} end)
        + {license: \"MIT\"}
        + {version: .version}
        + {publishConfig: {access: \"public\", provenance: true}}
        + (if .design then {design: .design} else {} end)
        + {repository: {type: \"git\", url: \"https://github.com/Khan/wonder-stuff.git\", directory: \"$dir\"}}
        + {bugs: {url: \"https://github.com/Khan/wonder-blocks/issues\"}}
        + (if .module then {module: .module} else {} end)
        + (if .main then {main: .main} else {} end)
        + (if .types then {types: .types} else {} end)
        + (if .source then {source: .source} else {} end)
        + (if .exports then {exports: .exports} else {} end)
        + (if .files then {files: .files} else {} end)
        + (if .scripts then {scripts: .scripts} else {} end)
        + (if .nobuild then {nobuild: .nobuild} else {} end)
        + (if .dependencies then {dependencies: .dependencies} else {} end)
        + (if .peerDependencies then {peerDependencies: .peerDependencies} else {} end)
        + (if .devDependencies then {devDependencies: .devDependencies} else {} end)
        + (if .browser then {browser: .browser} else {} end)
        + (if .bin then {bin: .bin} else {} end)
        + (if .engines then {engines: .engines} else {} end)
    " "$dir/package.json" > "$dir/package.out.json"
    mv "$dir/package.out.json" "$dir/package.json"
done
