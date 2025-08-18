#!/usr/bin/env python3
import json
import sys
import subprocess
import os
import time
from datetime import datetime

def run_command(cmd):
    """运行命令并返回结果"""
    result = subprocess.run(cmd, capture_output=True, text=True, shell=False)
    return result

def main():
    try:
        # Read input from stdin
        input_data = json.load(sys.stdin)
        prompt = input_data.get('prompt', '').strip()
        
        # Check if this is a /save command
        if prompt.startswith('/save'):
            # Change to project root directory
            project_root = '/Users/jaaason30/Desktop/react_start_project'
            os.chdir(project_root)
            
            # Ensure we're on main branch
            checkout_result = run_command(['git', 'checkout', 'main'])
            
            # Force refresh git index to detect all changes
            run_command(['git', 'update-index', '--refresh'])
            
            # Add all changes first (including deletions)
            add_result = run_command(['git', 'add', '-A'])
            
            # Check if there are staged changes
            diff_staged = run_command(['git', 'diff', '--cached', '--name-status'])
            
            if not diff_staged.stdout.strip():
                # No staged changes, check for unstaged changes
                status_result = run_command(['git', 'status', '--porcelain'])
                if not status_result.stdout.strip():
                    response = {
                        "blocked": True,
                        "reason": "ℹ️ No changes detected. Working directory is clean."
                    }
                    print(json.dumps(response))
                    return
                else:
                    # Try adding again
                    run_command(['git', 'add', '-A'])
                    diff_staged = run_command(['git', 'diff', '--cached', '--name-status'])
                    if not diff_staged.stdout.strip():
                        response = {
                            "blocked": True,
                            "reason": "ℹ️ Could not stage changes. Working directory may be clean."
                        }
                        print(json.dumps(response))
                        return
            
            # Parse the changes for better display
            changes_list = []
            for line in diff_staged.stdout.strip().split('\n'):
                if line:
                    parts = line.split('\t', 1)
                    if len(parts) == 2:
                        status, filename = parts
                        if status.startswith('A'):
                            changes_list.append(f"  ➕ Added: {filename}")
                        elif status.startswith('M'):
                            changes_list.append(f"  📝 Modified: {filename}")
                        elif status.startswith('D'):
                            changes_list.append(f"  ❌ Deleted: {filename}")
                        elif status.startswith('R'):
                            changes_list.append(f"  ♻️ Renamed: {filename}")
                        else:
                            changes_list.append(f"  • {filename}")
            
            # Create commit message
            commit_msg = f"Auto-save: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            if len(prompt) > 5:  # If there's additional text after /save
                custom_msg = prompt[5:].strip()
                if custom_msg:
                    commit_msg += f" - {custom_msg}"
            
            # Commit changes
            commit_result = run_command(['git', 'commit', '-m', commit_msg])
            
            if commit_result.returncode != 0:
                if "nothing to commit" in (commit_result.stdout + commit_result.stderr).lower():
                    response = {
                        "blocked": True,
                        "reason": "ℹ️ No changes to commit."
                    }
                else:
                    response = {
                        "blocked": True,
                        "reason": f"❌ Failed to commit: {commit_result.stderr or commit_result.stdout}"
                    }
                print(json.dumps(response))
                return
            
            # Push to remote with force
            push_result = run_command(['git', 'push', 'origin', 'main', '--force'])
            
            if push_result.returncode == 0:
                # Get the commit hash
                hash_result = run_command(['git', 'rev-parse', '--short', 'HEAD'])
                commit_hash = hash_result.stdout.strip()
                
                # Build success message
                changes_summary = '\n'.join(changes_list) if changes_list else 'Files updated'
                
                response = {
                    "blocked": True,
                    "reason": f"✅ Project saved and pushed successfully!\n\n" + 
                             f"📦 Commit: {commit_msg}\n" +
                             f"🔖 Hash: {commit_hash}\n" +
                             f"🌿 Branch: origin/main (force pushed)\n\n" +
                             f"📝 Changes:\n{changes_summary}"
                }
            else:
                response = {
                    "blocked": True,
                    "reason": f"❌ Failed to push: {push_result.stderr or push_result.stdout}"
                }
            
            print(json.dumps(response))
            return
    
    except Exception as e:
        response = {
            "blocked": True,
            "reason": f"❌ Error executing /save: {str(e)}"
        }
        print(json.dumps(response))
        return
    
    # If not a /save command, allow normal processing
    response = {"blocked": False}
    print(json.dumps(response))

if __name__ == "__main__":
    main()