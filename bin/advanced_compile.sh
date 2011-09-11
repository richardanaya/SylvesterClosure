python closure-tools/closure/bin/build/closurebuilder.py --root closure-tools --root ../src --namespace "sylvester" --output_mode=compiled --compiler_jar=closure-tools/compiler.jar --compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" > output/output.min.js
./move_outputs.sh
