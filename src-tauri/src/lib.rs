use serde::{Serialize, Deserialize};
use std::fs;
use std::path::PathBuf;
use walkdir::WalkDir;
use tauri::{AppHandle, Manager};

#[derive(Serialize, Deserialize, Debug)]
pub struct Skill {
    id: String,
    name: String,
    description: String,
    version: String,
    author: String,
    status: String,
}

#[derive(Deserialize)]
struct SkillManifest {
    skill: SkillData,
}

#[derive(Deserialize)]
struct SkillData {
    id: String,
    name: String,
    description: String,
    version: String,
    author: String,
}

#[tauri::command]
fn get_skills(app_handle: AppHandle) -> Vec<Skill> {
    let mut skills = Vec::new();
    
    // Get the app data directory
    let app_data_dir = app_handle.path().app_data_dir().unwrap_or_else(|_| {
        // Fallback for development if app_data_dir fails
        PathBuf::from("skills")
    });
    
    let skills_dir = app_data_dir.join("skills");
    
    // Ensure the directory exists
    if !skills_dir.exists() {
        let _ = fs::create_dir_all(&skills_dir);
        return vec![];
    }

    for entry in WalkDir::new(skills_dir)
        .max_depth(2)
        .into_iter()
        .filter_map(|e| e.ok()) {
        
        let path = entry.path();
        if path.is_file() && path.file_name().map_or(false, |n| n == "skill.toml") {
            if let Ok(content) = fs::read_to_string(path) {
                if let Ok(manifest) = toml::from_str::<SkillManifest>(&content) {
                    skills.push(Skill {
                        id: manifest.skill.id,
                        name: manifest.skill.name,
                        description: manifest.skill.description,
                        version: manifest.skill.version,
                        author: manifest.skill.author,
                        status: "active".into(), // Default status
                    });
                }
            }
        }
    }
    
    skills
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![get_skills])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
