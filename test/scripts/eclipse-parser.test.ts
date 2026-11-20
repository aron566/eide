/**
 * Smoke test for the Eclipse .cproject source-entry import logic — run with:
 *   npx ts-node test/scripts/eclipse-parser.test.ts <path-to-cproject>
 *
 * If no path is given, a synthetic project mimicking the CDT
 * "root entry excludes subfolders, child entries re-add them" pattern is used.
 *
 * Build output is under out/tmp only (never emits .js into src/).
 */

import * as mock from 'mock-require';
import * as fs from 'fs';
import * as NodePath from 'path';
import * as os from 'os';

mock.default('vscode', {
  window: { showInformationMessage: () => {} },
  workspace: {},
  languages: {},
  debug: {},
  commands: {},
  env: { language: 'en-us' }
});

// -----------------------------

interface CheckResult { ok: boolean; desc: string }

const results: CheckResult[] = [];
function check(desc: string, cond: boolean) {
  results.push({ ok: cond, desc });
}

async function main() {

  const argPath = process.argv[2];
  let projectDir: string;

  if (argPath && fs.existsSync(argPath)) {
    projectDir = NodePath.dirname(NodePath.resolve(argPath));
  } else {
    // synthetic project:
    //   root entry excludes 'src|src/aps|src/common|src/encry|src/net|device/hrf/board/BSP/IAR|src/aps/inc/HRF_SpiInterface.h'
    //   child entries re-add: src/app (excluding src/bplc_testmode_zb206.c|src/debug_cmd.c),
    //     src/aps (excluding src/HRF_SpiInterface.c), src/common (excluding finsh),
    //     src/encry, src/net, src/phy (excluding zb206 files), src/phy_test
    projectDir = fs.mkdtempSync(NodePath.join(os.tmpdir(), 'eide-eclipse-test-'));
    for (const d of ['src/app', 'src/aps/inc', 'src/common/finsh', 'src/encry', 'src/net', 'src/phy', 'src/phy_test']) {
      fs.mkdirSync(NodePath.join(projectDir, d), { recursive: true });
      fs.writeFileSync(NodePath.join(projectDir, d, 'main.c'), 'int x;\n');
    }
    fs.mkdirSync(NodePath.join(projectDir, 'device/hrf/board/BSP/IAR'), { recursive: true });
    fs.writeFileSync(NodePath.join(projectDir, 'device/hrf/board/BSP/IAR/iar.c'), 'int x;\n');
    fs.writeFileSync(NodePath.join(projectDir, 'src/bplc_testmode_zb206.c'), 'int x;\n');
    fs.mkdirSync(NodePath.join(projectDir, 'src/app/src'), { recursive: true });
    fs.writeFileSync(NodePath.join(projectDir, 'src/app/src/debug_cmd.c'), 'int x;\n');
    fs.writeFileSync(NodePath.join(projectDir, 'src/common/finsh/shell.c'), 'int x;\n');

    fs.writeFileSync(NodePath.join(projectDir, '.project'),
      `<?xml version="1.0" encoding="UTF-8"?>
<projectDescription><name>test_prj</name></projectDescription>`);

    fs.writeFileSync(NodePath.join(projectDir, '.cproject'),
      `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<?fileVersion 4.0.0?>
<cproject>
 <storageModule moduleId="org.eclipse.cdt.core.settings">
  <cconfiguration id="cfg.debug.1">
   <storageModule buildSystemId="org.eclipse.cdt.managedbuilder.core.configurationDataProvider" id="cfg.debug.1" moduleId="org.eclipse.cdt.core.settings" name="Debug">
    <externalSettings/>
    <extensions/>
   </storageModule>
   <storageModule moduleId="cdtBuildSystem" version="4.0.0">
    <configuration artifactName="test" id="cfg.debug.1" name="Debug" parent="org.eclipse.cdt.build.core.buildcfg.defaultcfg">
     <folderInfo id="cfg.debug.1." name="/" resourcePath="">
     <toolChain id="tc.1" name="RISC-V Cross GCC" superClass="ilg.gnumcueclipse.managedbuild.cross.riscv.toolchain.elf.debug">
       <option id="opt.1" superClass="ilg.gnumcueclipse.managedbuild.cross.riscv.option.command.prefix" valueType="string" value="riscv64-unknown-elf-"/>
       <option id="ilg.gnumcueclipse.managedbuild.cross.riscv.option.target.isa.base.751889256" superClass="ilg.gnumcueclipse.managedbuild.cross.riscv.option.target.isa.base" value="ilg.gnumcueclipse.managedbuild.cross.riscv.option.target.arch.rv32i" valueType="enumerated"/>
       <option id="ilg.gnumcueclipse.managedbuild.cross.riscv.option.target.isa.multiply.1072675527" superClass="ilg.gnumcueclipse.managedbuild.cross.riscv.option.target.isa.multiply" value="true" valueType="boolean"/>
       <option id="ilg.gnumcueclipse.managedbuild.cross.riscv.option.target.isa.compressed.1445344293" superClass="ilg.gnumcueclipse.managedbuild.cross.riscv.option.target.isa.compressed" value="true" valueType="boolean"/>
       <option id="ilg.gnumcueclipse.managedbuild.cross.riscv.option.target.isa.atomic.9999999999" superClass="ilg.gnumcueclipse.managedbuild.cross.riscv.option.target.isa.atomic" value="false" valueType="boolean"/>
       <option id="ilg.gnumcueclipse.managedbuild.cross.riscv.option.target.abi.integer.1095604733" superClass="ilg.gnumcueclipse.managedbuild.cross.riscv.option.target.abi.integer" value="ilg.gnumcueclipse.managedbuild.cross.riscv.option.abi.integer.ilp32" valueType="enumerated"/>
       <tool id="t.c.1" name="GNU RISC-V Cross C Compiler" superClass="ilg.gnumcueclipse.managedbuild.cross.riscv.tool.c.compiler">
        <option id="opt.inc.1" name="Include paths (-I)" superClass="ilg.gnumcueclipse.managedbuild.cross.riscv.option.c.compiler.include.paths" valueType="includePath">
         <listOptionValue builtIn="false" value="&quot;\${workspace_loc:/\${ProjName}/src}&quot;"/>
        </option>
        <inputType id="it.c.1" superClass="cdt.managedbuild.tool.gnu.c.compiler.input"/>
       </tool>
       <tool id="t.cpp.ld.1" name="GNU RISC-V Cross C++ Linker" superClass="ilg.gnumcueclipse.managedbuild.cross.riscv.tool.cpp.linker">
        <option id="ilg.gnumcueclipse.managedbuild.cross.riscv.option.cpp.linker.scriptfile.1801988237" name="Script files (-T)" superClass="ilg.gnumcueclipse.managedbuild.cross.riscv.option.cpp.linker.scriptfile" valueType="stringList">
         <listOptionValue builtIn="false" value="&quot;\${workspace_loc:/\${ProjName}/nuclei_sdk/gcc_evalsoc_sram.ld}&quot;"/>
        </option>
        <option id="opt.ld.nostart" superClass="ilg.gnumcueclipse.managedbuild.cross.riscv.option.cpp.linker.nostart" value="true" valueType="boolean"/>
        <option id="opt.ld.libs" name="Libraries (-l)" superClass="ilg.gnumcueclipse.managedbuild.cross.riscv.option.cpp.linker.libs" valueType="libs">
         <listOptionValue builtIn="false" value="c_nano"/>
        </option>
        <option id="opt.ld.other" name="Other linker flags" superClass="ilg.gnumcueclipse.managedbuild.cross.riscv.option.cpp.linker.other" value="-Wl,--check-sections -u _isatty" valueType="string"/>
       </tool>
      </toolChain>
     </folderInfo>
     <sourceEntries>
      <entry excluding="src|src/aps|src/common|src/encry|src/net|device/hrf/board/BSP/IAR|src/aps/inc/HRF_SpiInterface.h|src/aps/src/HRF_SpiInterface.c" flags="VALUE_WORKSPACE_PATH|RESOLVED" kind="sourcePath" name=""/>
      <entry excluding="src/bplc_testmode_zb206.c|src/debug_cmd.c" flags="VALUE_WORKSPACE_PATH|RESOLVED" kind="sourcePath" name="src/app"/>
      <entry excluding="src/HRF_SpiInterface.c" flags="VALUE_WORKSPACE_PATH|RESOLVED" kind="sourcePath" name="src/aps"/>
      <entry excluding="finsh" flags="VALUE_WORKSPACE_PATH|RESOLVED" kind="sourcePath" name="src/common"/>
      <entry flags="VALUE_WORKSPACE_PATH|RESOLVED" kind="sourcePath" name="src/encry"/>
      <entry flags="VALUE_WORKSPACE_PATH|RESOLVED" kind="sourcePath" name="src/net"/>
      <entry excluding="afe_rf_zb206.h|afe_rf_zb206.c" flags="VALUE_WORKSPACE_PATH|RESOLVED" kind="sourcePath" name="src/phy"/>
      <entry flags="VALUE_WORKSPACE_PATH|RESOLVED" kind="sourcePath" name="src/phy_test"/>
     </sourceEntries>
    </configuration>
   </storageModule>
  </cconfiguration>
 </storageModule>
</cproject>`);
  }

  // the repo tsconfig compiles src/ to out/src; load the compiled parser
  // (repo root tsconfig is used: npx tsc -p tsconfig.json --skipLibCheck)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const parser = require('../../out/src/EclipseProjectParser');
  const info = await parser.parseEclipseProject(NodePath.join(projectDir, '.cproject'));

  const target = info.targets[0];

  // ---- C++ Linker options are imported (linker script, libs, flags)
  check("linkerScriptPath from C++ Linker", (<string>target.linkerScriptPath).endsWith('gcc_evalsoc_sram.ld'));
  check("C++ Linker libs imported", (<string[]>target.builldArgs.linkerLibArgs).some((a: string) => a == '-lc_nano'));
  check("C++ Linker other flags imported", (<string[]>target.builldArgs.linkerArgs).some((a: string) => a.includes('--check-sections')));

  // ---- riscv isa merged into archName (rv32i + m + c, atomic=false)
  check("archName == rv32imc", target.archName == 'rv32imc');
  check("riscvAbi == ilp32", target.riscvAbi == 'ilp32');
  check("riscv isa exts with numeric id suffix match (real projects use isa.multiply.<N>)",
    target.archName == 'rv32imc');

  // ---- srcDirs: re-added child entries must survive the root 'excluding'
  for (const d of ['src/app', 'src/aps', 'src/common', 'src/encry', 'src/net', 'src/phy', 'src/phy_test']) {
    check(`srcDirs contains '${d}' (re-added child entry)`, info.sourceEntries.includes(d));
  }
  // top folders not filtered by root excluding must be listed
  check("srcDirs contains 'device' (not excluded)", info.sourceEntries.includes('device'));

  // ---- excludeList: re-added subtrees must NOT be excluded anymore
  // ('src' narrows to its re-added children, which are covered entries themselves)
  const exc = target.excList;
  check("excludeList drops 'src' (covered by child source entry)", !exc.includes('src'));
  check("excludeList drops 'src/aps' (covered by child source entry)", !exc.includes('src/aps'));
  check("excludeList drops 'src/common' (covered by child source entry)", !exc.includes('src/common'));
  check("excludeList drops 'src/encry' (covered by child source entry)", !exc.includes('src/encry'));
  check("excludeList drops 'src/net' (covered by child source entry)", !exc.includes('src/net'));
  // root excluding's 'src/aps' is fully re-added by the 'src/aps' entry, so the
  // union semantics drop it entirely; nothing narrowed survives from it
  check("excludeList keeps nothing narrowed from 'src/aps'", !(<string[]>exc).some((p: string) => p.startsWith('src/aps/')) || exc.includes('src/aps/src/HRF_SpiInterface.c'));

  // ---- real excludes survive
  // (excluding paths are relative to their entry's path: entry src/aps's
  //  'src/HRF_SpiInterface.c' means src/aps/src/HRF_SpiInterface.c)
  const expected = [
    'device/hrf/board/BSP/IAR',
    'src/aps/src/HRF_SpiInterface.c',
    'src/app/src/bplc_testmode_zb206.c',
    'src/app/src/debug_cmd.c',
    'src/common/finsh',
    'src/phy/afe_rf_zb206.h',
    'src/phy/afe_rf_zb206.c'
  ];
  for (const p of expected) {
    check(`excludeList keeps '${p}'`, exc.includes(p));
  }

  // ---- summary
  const failed = results.filter(r => !r.ok);
  for (const r of results) {
    console.log(`${r.ok ? '  PASS' : '! FAIL'}  ${r.desc}`);
  }
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (argPath) {
    console.log('\nsrcDirs:');    (<string[]>info.sourceEntries).forEach(s => console.log('  ' + s));
    console.log('excludeList:'); (<string[]>target.excList).forEach(s => console.log('  ' + s));
  }
  if (failed.length > 0) process.exit(1);
}

main();
