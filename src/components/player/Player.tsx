import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, useGLTF, useKeyboardControls } from '@react-three/drei';
import { BallCollider, CollisionTarget, interactionGroups, quat, RapierRigidBody, RigidBody, vec3 } from '@react-three/rapier';
import * as THREE from 'three';
import { base64GLB } from '../../player.glb';

const normalizeAngle = (angle: number) => {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
};

const lerpAngle = (start: number, end: number, t: number) => {
    start = normalizeAngle(start);
    end = normalizeAngle(end);

    if (Math.abs(end - start) > Math.PI) {
        if (end > start) {
            start += 2 * Math.PI;
        } else {
            end += 2 * Math.PI;
        }
    }

    return normalizeAngle(start + (end - start) * t);
};


export const Player = () => {
    // console.log('Player')
    const { scene } = useThree();
    const player = useRef<any>(null);
    const rb = useRef<RapierRigidBody>(null);
    const playerRotationTarget = useRef<any>(0);
    const rotationTarget = useRef<any>(0);
    const [, get] = useKeyboardControls();
    const [speed, setSpeed] = useState<number>(5);
    const { nodes: playerNodes, scene: playerModel } = useGLTF(base64GLB);
    const effectStartPosition = useRef<THREE.Vector3>(vec3({ x: 0, y: 0, z: 0 }));
    const effectTargetPosition = useRef<THREE.Vector3>(vec3({ x: 0, y: 0, z: 0 }));
    const isClicking = useRef<boolean>(false);
    const isShooting = useRef<boolean>(false);
    const isMoving = useRef<boolean>(false);
    const playerHitBoxRef = useRef<any>(null);
    const [playerOnHitExpandingRingHitBoxSize, setPlayerOnHitExpandingRingHitBoxSize] = useState<number>(0);
    const playerInvincibilityTime = 0.8
    const isPlayerOnHit = useRef<boolean>(false)
    const playerInvincibilityTimeAccumulatedTime = useRef<number>(0)
    const playerOnHitColorReturnNormal = useRef<boolean>(false)
    const [shootingInterval, setShootingInterval] = useState<number>(0.0986)
    const disableMove = useRef<boolean>(false)
    const resetPlayerPositionRef = useRef<boolean>(false)
    const playerLocalSummery = useRef<{
        onHitCount: number,
        totalShootCount: number,
    }>({
        onHitCount: 0,
        totalShootCount: 0,
    })

    const onMouseDown = (e: any) => {
        if (e.button === 0) {
            isClicking.current = true;
        }
        if ((e.button === 2 && isClicking.current)) {
            isShooting.current = true;
        }
    }
    const onMouseUp = (e: any) => {
        if (e.button === 0) {
            isClicking.current = false;
        }
        if (e.button === 2) {
            isShooting.current = false;
        }
    }
    const handleContextMenu = (event: any) => {
        event.preventDefault(); // 阻止默认的右键菜单
    };

    const shootProjectile = () => {
        playerLocalSummery.current.totalShootCount += 1
        const direction = vec3().set(
            Math.sin(player.current.rotation.y) * 2,
            0,
            Math.cos(player.current.rotation.y) * 2
        );

        // 计算射弹的旋转，由于模型的朝向横向的，我们要转成纵向的
        const projectileRotation = quat().setFromUnitVectors(
            vec3({ x: 1, y: 0, z: 0 }), // 模型的朝向
            direction.clone().normalize() // 射弹方向
        );

        // 添加额外的旋转，将模型绕自身的 X 轴旋转 45 度
        const additionalRotation = quat().setFromAxisAngle(
            vec3({ x: 1, y: 0, z: 0 }), // 绕 X 轴旋转
            Math.PI / 4 // 45 度
        );

        // 合并两个旋转
        projectileRotation.multiply(additionalRotation);
    }

    const lastShotTime = useRef(0); // 用于存储上次射击时间
    const playerEffectsSpawnTime = useRef(0); // 用于存储上次生成玩家特效的时间
    useFrame((state, delta) => {
        if (disableMove.current) {
            return
        }
        //如果同时按下鼠标右键和左键
        if (isShooting.current) {
            const currentTime = state.clock.getElapsedTime(); // 获取当前时间
            if (currentTime - lastShotTime.current >= shootingInterval) { // 检查间隔
                shootProjectile();
                lastShotTime.current = currentTime; // 更新上次射击时间
            }
        }

    });

    useEffect(() => {

        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('contextmenu', handleContextMenu);
        return () => {
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('contextmenu', handleContextMenu);
        }
    }, [])

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const lookBottom = new THREE.Vector3(0, 1, 0)

    useFrame((state, delta) => {
        if (disableMove.current) return
        if (rb.current) {
            const vel = rb.current?.linvel();
            const rbTranslation = rb.current.translation();
            const movement = {
                x: 0,
                z: 0
            }

            if (get().forward) movement.z = speed
            if (get().backward) movement.z = -speed
            if (get().left) movement.x = speed
            if (get().right) movement.x = -speed

            if (movement.x !== 0) {
                rotationTarget.current += 0.1 * movement.x;
            }

            if (movement.x !== 0 || movement.z !== 0) {
                playerRotationTarget.current = Math.atan2(movement.x, movement.z);
                vel.x = 1 * movement.x;
                vel.z = 1 * movement.z;
                isMoving.current = true
            } else {
                vel.x = 0;
                vel.z = 0;
                isMoving.current = false
            }

            let rotationSpeed = 0.2
            // 如果正在点击鼠标，更新玩家朝向
            if (isClicking.current) {
                // 计算鼠标在世界坐标中的位置
                mouse.x = state.pointer.x // 将指针坐标标准化到 -1 到 1
                mouse.y = state.pointer.y // 这里可能需要调整为正值以适应从上往下看的视角

                // 使用射线投射获取鼠标指向的世界坐标
                raycaster.setFromCamera(mouse, state.camera);

                // 假设地面是水平的，平面的法向量为 (0, 1, 0)
                const groundPlane = new THREE.Plane(lookBottom, 0); // 修改为 (0, 0, 1) 以适应从上往下的视角
                const intersect = raycaster.ray.intersectPlane(groundPlane, vec3());

                if (intersect) {
                    const targetPoint = intersect; // 获取鼠标目标点
                    // 计算玩家朝向的角度，注意这里可能需要调整 x 和 z 的顺序
                    playerRotationTarget.current = Math.atan2(targetPoint.x - rbTranslation.x, targetPoint.z - rbTranslation.z);
                    rotationSpeed = 0.8
                }
            }

            player.current.rotation.y = lerpAngle(
                player.current.rotation.y,
                playerRotationTarget.current,
                rotationSpeed
            );

            rb.current.setLinvel(vel, true);
            //spawn player movement particles
            const position = rb.current?.translation(); // 获取物理引擎中的位置
            if (position) {
                effectStartPosition.current.set(position.x, position.y, position.z);
                //effectTargetPosition是从effectStartPosition的位置开始
                // 随机方向
                const distance = 0.1;
                effectTargetPosition.current.set(
                    position.x + Math.random() * distance - distance / 2,
                    position.y + Math.random() * distance - distance / 2,
                    position.z + Math.random() * distance - distance / 2
                );
            }

            //如果玩家被击中
            if (isPlayerOnHit.current) {
                playerInvincibilityTimeAccumulatedTime.current += delta
                if (playerOnHitExpandingRingHitBoxSize < 0.4) {
                    setPlayerOnHitExpandingRingHitBoxSize(prev => prev + 0.009)
                }
                if (playerInvincibilityTimeAccumulatedTime.current >= playerInvincibilityTime) {
                    isPlayerOnHit.current = false
                    playerInvincibilityTimeAccumulatedTime.current = 0
                    setPlayerOnHitExpandingRingHitBoxSize(0)
                }
            }

            if (playerOnHitColorReturnNormal.current) {
                //如果玩家被击中后，颜色变黑色，在useFrame内逐渐恢复颜色
                const header: any = playerNodes['Header']
                const headerColor = header.material.color
                if (headerColor.r < 0.5 && headerColor.g < 0.5 && headerColor.b < 0.5) {
                    header.material.color.set(headerColor.r + 0.002, headerColor.g + 0.002, headerColor.b + 0.002)
                } else {
                    playerOnHitColorReturnNormal.current = false
                }
            }

            //如果玩家移动
            if (isMoving.current) {
                //每隔0.1秒生成一个特效
                playerEffectsSpawnTime.current += delta;
                if (playerEffectsSpawnTime.current >= (0.08 + Math.random() * 0.14)) {
                    playerEffectsSpawnTime.current = 0;
                }
            }

            const otherPlayerContainer = state.scene.getObjectByName('OtherPlayerContainer')
            if (otherPlayerContainer) {
                const rbTr = rb.current.translation()
                otherPlayerContainer?.position.copy(vec3(rbTr))
            }
        }
    })

    const handlePlayerOnHitChangeColor = () => {
        const header: any = playerNodes['Header']
        header.material.color.set(0, 0, 0)
        playerOnHitColorReturnNormal.current = true
    }

    const handleNeedOtherPlayerOnHit = (rbTr: any) => {

    }

    const onHit = ((target: CollisionTarget, other: CollisionTarget) => {
        //如果玩家在无敌时间内，不受伤
        if (other.rigidBodyObject?.userData.type === 'enemy_normal_projectile' ||
            other.rigidBodyObject?.userData.type === 'enemy_unbroken_projectile'
        ) {
            isPlayerOnHit.current = true
            //还在无敌时间内，不受伤
            if (playerInvincibilityTimeAccumulatedTime.current < playerInvincibilityTime) {
                //如果是第一次被击中，生成特效
                if (playerInvincibilityTimeAccumulatedTime.current == 0) {
                    const rbTr = rb.current?.translation()
                    //正常受伤
                    handlePlayerOnHitChangeColor()
                }
            }
        }
    })

    const resetPlayerModel = () => {
        playerNodes['L_MOMO_1'].visible = true
        playerNodes['L_ASHI'].visible = true
        playerNodes['R_MOMO_1'].visible = true
        playerNodes['R_ASHI'].visible = true
        playerNodes['Center'].visible = true
        playerNodes['Header'].visible = true
    }
    const newPosition = vec3({ x: 0, y: 0, z: 0 });
    useFrame(() => {
        if (rb.current && resetPlayerPositionRef.current) {
            const playerRb = rb.current;
            if (!vec3(playerRb.translation()).equals(newPosition)) {
                playerRb.setTranslation(newPosition, true); // 更新刚体位置
                playerRb.setLinvel(vec3({ x: 0, y: 0, z: 0 }), true); // 重置线速度
                playerRb.setAngvel(vec3({ x: 0, y: 0, z: 0 }), true); // 重置角速度
                player.current.position.copy(newPosition);
                player.current.rotation.y = 0;
                resetPlayerPositionRef.current = false
            }
        }
    })

    useEffect(() => {

    }, [])

    return (
        <>
            <RigidBody
                name='player_rigidbody'
                lockRotations
                ref={rb}
                collisionGroups={interactionGroups(0, [100, 1, 2, 3])}
                colliders={false}
                userData={{ type: 'player' }}
                onCollisionEnter={({ manifold, target, other }) => {
                    onHit(target, other)
                }}
            >
                <group ref={player} position={[0, 0, 0]} name='player_rigidbody_group'>
                    <primitive object={playerModel} scale={[20, 30, 20]} />
                    <BallCollider
                        collisionGroups={interactionGroups(0, [100, 1, 2, 3])}
                        name="player_collider"
                        args={[0.5]} // 动态调整球体碰撞体的半径
                    />
                    <BallCollider
                        collisionGroups={interactionGroups(0, [1, 2, 3])}//不和墙壁碰撞
                        name='player_on_hit_expanding_ring_hit_box'
                        ref={playerHitBoxRef}
                        args={[playerOnHitExpandingRingHitBoxSize]} // 动态调整球体碰撞体的半径
                    />

                </group>
            </RigidBody>
        </>
    );
};


useGLTF.preload(base64GLB)